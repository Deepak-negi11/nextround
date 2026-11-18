"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma, TX_OPTIONS } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { checkEligibility } from "@/lib/eligibility";
import { notifyUsers } from "@/lib/notify";

export type ActionState = { error?: string; ok?: string };


export async function createCompany(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) return { error: "Company name is required." };
  const exists = await prisma.company.findUnique({ where: { companyName } });
  if (exists) return { error: "This company already exists." };

  await prisma.company.create({
    data: {
      companyName,
      industry: String(formData.get("industry") || "").trim() || null,
      website: String(formData.get("website") || "").trim() || null,
      contactName: String(formData.get("contactName") || "").trim() || null,
      contactEmail: String(formData.get("contactEmail") || "").trim() || null,
    },
  });
  revalidatePath("/admin/companies");
  return { ok: `Company "${companyName}" added.` };
}

/* ---------------- Drives ---------------- */

export async function createDrive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const companyId = parseInt(String(formData.get("companyId")));
  const jobRole = String(formData.get("jobRole") ?? "").trim();
  const pkg = parseFloat(String(formData.get("package")));
  const deadline = new Date(String(formData.get("applicationDeadline")));
  const minimumCgpa = parseFloat(String(formData.get("minimumCgpa")));
  const maximumBacklogs = parseInt(String(formData.get("maximumBacklogs")));
  const branches = formData.getAll("branches").map(String).filter(Boolean);
  const description = String(formData.get("description") || "").trim() || null;

  if (isNaN(companyId)) return { error: "Please select a valid company (add one under Companies first if needed)." };
  if (!jobRole) return { error: "Job role is required." };
  if (isNaN(pkg) || pkg <= 0) return { error: "Package (LPA) must be positive." };
  if (isNaN(deadline.getTime())) return { error: "Application deadline is invalid." };
  if (isNaN(minimumCgpa) || minimumCgpa < 0 || minimumCgpa > 10) return { error: "Minimum CGPA must be 0–10." };
  if (isNaN(maximumBacklogs) || maximumBacklogs < 0) return { error: "Max backlogs must be 0 or more." };
  if (branches.length === 0) return { error: "Select at least one eligible branch." };

  const drive = await prisma.drive.create({
    data: {
      companyId,
      jobRole,
      package: pkg,
      description,
      applicationDeadline: deadline,
      driveStatus: "DRAFT",
      eligibilityRule: { create: { minimumCgpa, maximumBacklogs } },
      branches: { create: branches.map((branchName) => ({ branchName })) },
    },
  });
  redirect(`/admin/drives/${drive.id}`);
}

export async function setDriveStatus(formData: FormData) {
  await requireRole("ADMIN");
  const driveId = parseInt(String(formData.get("driveId")));
  const status = String(formData.get("status")) as "DRAFT" | "PUBLISHED" | "CLOSED" | "COMPLETED";

  const drive = await prisma.drive.update({
    where: { id: driveId },
    data: { driveStatus: status },
    include: { company: true, eligibilityRule: true, branches: true },
  });

  // Publishing a drive announces it to every student who matches the eligibility rules
  if (status === "PUBLISHED") {
    const students = await prisma.student.findMany();
    const eligible = students.filter((s) =>
      checkEligibility(s, {
        minimumCgpa: drive.eligibilityRule?.minimumCgpa ?? 0,
        maximumBacklogs: drive.eligibilityRule?.maximumBacklogs ?? 0,
        branches: drive.branches.map((b) => b.branchName),
      }).eligible
    );
    await notifyUsers(
      eligible.map((s) => s.userId),
      `New drive open — ${drive.company.companyName}`,
      `${drive.jobRole} · ₹${Number(drive.package)} LPA · apply by ${new Date(drive.applicationDeadline).toLocaleDateString()}.`,
      `/student/drives/${drive.id}`
    );
  }

  revalidatePath(`/admin/drives/${driveId}`);
  revalidatePath("/admin/drives");
  revalidatePath("/student/drives");
}

export async function updateEligibility(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const driveId = parseInt(String(formData.get("driveId")));
  const minimumCgpa = parseFloat(String(formData.get("minimumCgpa")));
  const maximumBacklogs = parseInt(String(formData.get("maximumBacklogs")));
  const branches = formData.getAll("branches").map(String).filter(Boolean);
  if (isNaN(minimumCgpa) || minimumCgpa < 0 || minimumCgpa > 10 || isNaN(maximumBacklogs) || maximumBacklogs < 0 || branches.length === 0)
    return { error: "Invalid CGPA, backlogs or no branches selected." };

  // One transaction: if inserting the new branch list fails, the old list is not left deleted
  // (which would make the drive open to nobody).
  await prisma.$transaction([
    prisma.eligibilityRule.upsert({
      where: { driveId },
      create: { driveId, minimumCgpa, maximumBacklogs },
      update: { minimumCgpa, maximumBacklogs },
    }),
    prisma.driveBranch.deleteMany({ where: { driveId } }),
    prisma.driveBranch.createMany({
      data: branches.map((branchName) => ({ driveId, branchName })),
    }),
  ]);
  revalidatePath(`/admin/drives/${driveId}`);
  return { ok: "Eligibility rules updated." };
}

/* ---------------- Rounds ---------------- */

export async function createRound(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const driveId = parseInt(String(formData.get("driveId")));
  const roundType = String(formData.get("roundType") ?? "").trim();
  const customType = String(formData.get("customType") ?? "").trim();
  const mode = String(formData.get("mode")) === "OFFLINE" ? "OFFLINE" : "ONLINE";
  const type = roundType === "custom" ? customType : roundType;
  if (!type) return { error: "Round type is required." };

  const last = await prisma.round.findFirst({
    where: { driveId },
    orderBy: { roundNumber: "desc" },
  });

  const parse = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    return v ? new Date(v) : null;
  };

  const startAt = parse("startAt");
  const endAt = parse("endAt");
  if ((startAt && isNaN(startAt.getTime())) || (endAt && isNaN(endAt.getTime()))) return { error: "A date or time is invalid." };
  if (startAt && endAt && endAt <= startAt) return { error: "The round must end after it starts." };

  await prisma.round.create({
    data: {
      driveId,
      roundNumber: (last?.roundNumber ?? 0) + 1,
      roundType: type,
      mode,
      startAt,
      endAt,
      resultDate: parse("resultDate"),
      meetingLink: mode === "ONLINE" ? String(formData.get("meetingLink") || "").trim() || null : null,
      instructions: mode === "ONLINE" ? String(formData.get("instructions") || "").trim() || null : null,
      venue: mode === "OFFLINE" ? String(formData.get("venue") || "").trim() || null : null,
      building: mode === "OFFLINE" ? String(formData.get("building") || "").trim() || null : null,
      roomNumber: mode === "OFFLINE" ? String(formData.get("roomNumber") || "").trim() || null : null,
      reportingTime: mode === "OFFLINE" ? String(formData.get("reportingTime") || "").trim() || null : null,
    },
  });
  revalidatePath(`/admin/drives/${driveId}`);
  return { ok: `Round "${type}" added.` };
}

// The first round of a drive is the one that takes a shortlist from the applicants;
// every later round takes the students who cleared the round before it.
async function firstRoundId(driveId: number) {
  const first = await prisma.round.findFirst({ where: { driveId }, orderBy: { roundNumber: "asc" }, select: { id: true } });
  return first?.id ?? null;
}

// Step 1 of a round: the company sends back who it shortlisted, the admin ticks them here.
// Ticked → shortlisted (IN_PROGRESS); unticked → not shortlisted (REJECTED). Both are notified.
export async function shortlistForRound(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const roundId = parseInt(String(formData.get("roundId")));
  const everyone = formData.get("all") === "1";
  const picked = new Set(formData.getAll("applicationId").map((v) => Number(v)).filter(Number.isInteger));

  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { drive: { include: { company: true } } } });
  if (!round) return { error: "Round not found." };
  if (round.roundStatus !== "SCHEDULED") return { error: "The shortlist can only be changed before the round is announced." };
  if ((await firstRoundId(round.driveId)) !== round.id)
    return { error: "Only the first round takes a shortlist from applicants. Later rounds use the previous round's results." };

  const candidates = await prisma.application.findMany({
    where: { driveId: round.driveId, applicationStatus: { in: ["APPLIED", "IN_PROGRESS"] } },
    select: { id: true, applicationStatus: true, student: { select: { userId: true } } },
  });
  const chosen = everyone ? candidates : candidates.filter((c) => picked.has(c.id));
  if (chosen.length === 0) return { error: "Tick at least one student, or use “Shortlist everyone”." };
  const chosenIds = new Set(chosen.map((c) => c.id));
  const rest = candidates.filter((c) => !chosenIds.has(c.id));
  const newlyShortlisted = chosen.filter((c) => c.applicationStatus === "APPLIED");
  const company = round.drive.company.companyName;

  await prisma.$transaction(async (tx) => {
    const stillOpen = { in: ["APPLIED", "IN_PROGRESS"] as ("APPLIED" | "IN_PROGRESS")[] };
    await tx.application.updateMany({
      where: { id: { in: [...chosenIds] }, applicationStatus: stillOpen },
      data: { applicationStatus: "IN_PROGRESS" },
    });
    await tx.application.updateMany({
      where: { id: { in: rest.map((r) => r.id) }, applicationStatus: stillOpen },
      data: { applicationStatus: "REJECTED" },
    });
    await notifyUsers(
      newlyShortlisted.map((c) => c.student.userId),
      `Shortlisted for Round ${round.roundNumber} — ${company}`,
      `You're on the shortlist for ${round.roundType}. Date and details will follow when the round is announced.`,
      "/student/applications",
      tx
    );
    await notifyUsers(
      rest.map((c) => c.student.userId),
      `Not shortlisted — ${company}`,
      `${company} did not shortlist you for ${round.drive.jobRole}. Other drives are open — keep applying.`,
      "/student/drives",
      tx
    );
  }, TX_OPTIONS);

  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath(`/admin/drives/${round.driveId}`);
  revalidatePath("/student", "layout");
  return { ok: `${chosen.length} shortlisted, ${rest.length} not shortlisted. Students have been notified.` };
}

// Step 2: tell the students who are in this round its date, mode and venue or link.
export async function announceRound(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const roundId = parseInt(String(formData.get("roundId")));
  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { drive: { include: { company: true } } } });
  if (!round) return { error: "Round not found." };
  if (round.roundStatus !== "SCHEDULED") return { error: "This round has already been announced." };

  const unfinished = await prisma.round.findFirst({
    where: { driveId: round.driveId, roundNumber: { lt: round.roundNumber }, roundStatus: { not: "COMPLETED" } },
    select: { roundNumber: true },
  });
  if (unfinished) return { error: `Publish the results of Round ${unfinished.roundNumber} first.` };

  const inRound = await prisma.application.findMany({
    where: { driveId: round.driveId, applicationStatus: "IN_PROGRESS" },
    select: { student: { select: { userId: true } } },
  });
  if (inRound.length === 0) {
    const isFirst = (await firstRoundId(round.driveId)) === round.id;
    return {
      error: isFirst
        ? `Shortlist students for Round ${round.roundNumber} first (use the list below).`
        : "No students are in the running for this round.",
    };
  }

  let announced = false;
  await prisma.$transaction(async (tx) => {
    // Conditional update = the guard and the change in one statement: a double click changes nothing.
    const claimed = await tx.round.updateMany({
      where: { id: roundId, roundStatus: "SCHEDULED" },
      data: { roundStatus: "ANNOUNCED" },
    });
    if (claimed.count === 0) return;
    announced = true;
    await notifyUsers(
      inRound.map((a) => a.student.userId),
      `Round ${round.roundNumber} announced — ${round.roundType}`,
      `${round.drive.company.companyName} · ${round.drive.jobRole}. ${
        round.mode === "ONLINE" ? "Check the test link and instructions." : "Check the venue and reporting time."
      }`,
      "/student/applications",
      tx
    );
  }, TX_OPTIONS);

  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath(`/admin/drives/${round.driveId}`);
  revalidatePath("/student", "layout");
  return announced
    ? { ok: `Round ${round.roundNumber} announced to ${inRound.length} student(s).` }
    : { error: "This round has already been announced." };
}

export async function addSlot(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const roundId = parseInt(String(formData.get("roundId")));
  const startAt = new Date(String(formData.get("startAt")));
  const durationMin = parseInt(String(formData.get("durationMin"))) || 60;
  if (isNaN(startAt.getTime())) return { error: "Invalid slot start time." };
  if (durationMin < 1 || durationMin > 480) return { error: "Slot length must be between 1 and 480 minutes." };

  await prisma.interviewSlot.create({
    data: {
      roundId,
      startAt,
      endAt: new Date(startAt.getTime() + durationMin * 60000),
      venue: String(formData.get("venue") || "").trim() || null,
      meetingLink: String(formData.get("meetingLink") || "").trim() || null,
    },
  });
  revalidatePath(`/admin/rounds/${roundId}`);
  return { ok: "Slot added." };
}

export async function assignPanelist(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const roundId = parseInt(String(formData.get("roundId")));
  const interviewerId = parseInt(String(formData.get("interviewerId")));
  if (isNaN(interviewerId)) return { error: "Pick an interviewer." };
  const created = await prisma.roundPanelist
    .create({ data: { roundId, interviewerId } })
    .catch(() => null);
  revalidatePath(`/admin/rounds/${roundId}`);
  return created ? { ok: "Interviewer assigned." } : { error: "That interviewer is already assigned to this round." };
}

/* ---------------- Results & offers ---------------- */

// Step 3: the company sends back who cleared the round; the admin ticks them and publishes.
// "Final round" marks the cleared students Selected (ready for offers) and completes the drive;
// otherwise they stay in the running for the next round the company asks for.
export async function publishRoundResults(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  const roundId = parseInt(String(formData.get("roundId")));
  const finalChoice = String(formData.get("final") ?? "");
  if (finalChoice !== "yes" && finalChoice !== "no") return { error: "Choose whether this was the final round." };
  const isFinal = finalChoice === "yes";
  const cleared = new Set(formData.getAll("cleared").map((v) => Number(v)).filter(Number.isInteger));

  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { drive: { include: { company: true } } } });
  if (!round || round.roundStatus !== "ANNOUNCED") return { error: "Only an announced round can have its results published." };

  const candidates = await prisma.application.findMany({
    where: { driveId: round.driveId, applicationStatus: "IN_PROGRESS" },
    select: { id: true, student: { select: { userId: true } } },
  });
  if (candidates.length === 0) return { error: "No students are in this round." };
  const passed = candidates.filter((c) => cleared.has(c.id));
  const failed = candidates.filter((c) => !cleared.has(c.id));
  const passOutcome = isFinal ? "SELECTED" : "NEXT_ROUND";
  const company = round.drive.company.companyName;

  let published = false;
  await prisma.$transaction(async (tx) => {
    // Claim the round first: published twice (a double click) → nothing below runs again.
    const claimed = await tx.round.updateMany({
      where: { id: roundId, roundStatus: "ANNOUNCED" },
      data: { roundStatus: "COMPLETED" },
    });
    if (claimed.count === 0) return;
    published = true;

    // One result row per candidate for this round (keeps any score/remarks an interviewer entered).
    await tx.roundResult.createMany({
      data: passed.map((c) => ({ applicationId: c.id, roundId, outcome: passOutcome, recordedById: admin.id })),
      skipDuplicates: true,
    });
    await tx.roundResult.createMany({
      data: failed.map((c) => ({ applicationId: c.id, roundId, outcome: "REJECTED" as const, recordedById: admin.id })),
      skipDuplicates: true,
    });
    await tx.roundResult.updateMany({
      where: { roundId, applicationId: { in: passed.map((c) => c.id) } },
      data: { outcome: passOutcome },
    });
    await tx.roundResult.updateMany({
      where: { roundId, applicationId: { in: failed.map((c) => c.id) }, outcome: { not: "ABSENT" } },
      data: { outcome: "REJECTED" },
    });

    await tx.application.updateMany({
      where: { id: { in: failed.map((c) => c.id) } },
      data: { applicationStatus: "REJECTED" },
    });
    if (isFinal) {
      await tx.application.updateMany({
        where: { id: { in: passed.map((c) => c.id) } },
        data: { applicationStatus: "SELECTED" },
      });
      await tx.drive.update({ where: { id: round.driveId }, data: { driveStatus: "COMPLETED" } });
    }

    const passedIds = passed.map((c) => c.student.userId);
    if (isFinal)
      await notifyUsers(passedIds, `Selected! 🎉 — ${company}`, `You cleared the final ${round.roundType}. Your offer is on the way.`, "/student/offers", tx);
    else
      await notifyUsers(passedIds, `You cleared Round ${round.roundNumber} — ${company}`, `You're shortlisted for the next round. Its date will be announced soon.`, "/student/applications", tx);
    await notifyUsers(failed.map((c) => c.student.userId), `Result published — ${company}`, `Not selected in Round ${round.roundNumber} (${round.roundType}). More drives are open — keep going.`, "/student/drives", tx);
  }, TX_OPTIONS);

  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath(`/admin/drives/${round.driveId}`);
  revalidatePath("/admin");
  revalidatePath("/student", "layout");
  if (!published) return { error: "These results were already published." };
  return {
    ok: isFinal
      ? `Published. ${passed.length} selected (issue their offers on the drive page), ${failed.length} not selected.`
      : `Published. ${passed.length} go to the next round, ${failed.length} not selected.`,
  };
}

export async function issueOffer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const applicationId = parseInt(String(formData.get("applicationId")));
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      drive: { include: { company: true } },
      student: { include: { user: true } },
    },
  });
  if (!application || application.applicationStatus !== "SELECTED")
    return { error: "Offer can only be issued to selected students." };
  // Offers go out only once the drive's final round has been published
  if (application.drive.driveStatus !== "COMPLETED")
    return { error: "Publish the final round results before issuing offers." };

  try {
    await prisma.$transaction(async (tx) => {
      // The UNIQUE constraint on Offer.applicationId is what really stops a second offer: two admins
      // clicking at once can't both insert. (A "does one exist?" read first would be a race.)
      await tx.offer.create({
        data: { applicationId, package: application.drive.package },
      });
      await tx.application.update({
        where: { id: applicationId },
        data: { applicationStatus: "OFFERED" },
      });
      await notifyUsers(
        [application.student.user.id],
        `Offer from ${application.drive.company.companyName}! 🎉`,
        `${application.drive.jobRole} · ₹${Number(application.drive.package)} LPA — respond in your Offers page.`,
        "/student/offers",
        tx
      );
    }, TX_OPTIONS);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return { error: "An offer already exists for this application." };
    throw e;
  }
  revalidatePath(`/admin/drives/${application.driveId}`);
  revalidatePath("/student/offers");
  revalidatePath("/admin");
  return { ok: "Offer issued. Dashboard statistics updated." };
}
