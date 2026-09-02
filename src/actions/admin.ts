"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  await prisma.eligibilityRule.upsert({
    where: { driveId },
    create: { driveId, minimumCgpa, maximumBacklogs },
    update: { minimumCgpa, maximumBacklogs },
  });
  await prisma.driveBranch.deleteMany({ where: { driveId } });
  await prisma.driveBranch.createMany({
    data: branches.map((branchName) => ({ driveId, branchName })),
  });
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

  await prisma.round.create({
    data: {
      driveId,
      roundNumber: (last?.roundNumber ?? 0) + 1,
      roundType: type,
      mode,
      startAt: parse("startAt"),
      endAt: parse("endAt"),
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

export async function announceRound(formData: FormData) {
  await requireRole("ADMIN");
  const roundId = parseInt(String(formData.get("roundId")));
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      drive: {
        include: {
          company: true,
          applications: { include: { student: { include: { user: true } } } },
        },
      },
    },
  });
  if (!round) return;

  await prisma.round.update({ where: { id: roundId }, data: { roundStatus: "ANNOUNCED" } });
  // Applications entering their first announced round are now in progress
  await prisma.application.updateMany({
    where: { driveId: round.driveId, applicationStatus: "APPLIED" },
    data: { applicationStatus: "IN_PROGRESS" },
  });

  // Tell the students still in the running
  await notifyUsers(
    round.drive.applications
      .filter((a) => a.applicationStatus !== "REJECTED" && a.applicationStatus !== "OFFER_ACCEPTED")
      .map((a) => a.student.user.id),
    `Round ${round.roundNumber} announced — ${round.roundType}`,
    `${round.drive.company.companyName} · ${round.drive.jobRole}. ${
      round.mode === "ONLINE" ? "Check the test link and instructions." : "Check the venue and reporting time."
    }`,
    "/student/applications"
  );

  revalidatePath(`/admin/drives/${round.driveId}`);
  revalidatePath("/student/applications");
}

export async function addSlot(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const roundId = parseInt(String(formData.get("roundId")));
  const startAt = new Date(String(formData.get("startAt")));
  const durationMin = parseInt(String(formData.get("durationMin"))) || 60;
  if (isNaN(startAt.getTime())) return { error: "Invalid slot start time." };

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

// Publish a round's recorded outcomes: moves students forward, ends rejected ones,
// and marks the drive COMPLETE when the final round selects its students.
export async function publishRoundResults(formData: FormData) {
  await requireRole("ADMIN");
  const roundId = parseInt(String(formData.get("roundId")));
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      drive: {
        include: { company: true, rounds: { orderBy: { roundNumber: "asc" } } },
      },
    },
  });
  if (!round || round.roundStatus !== "ANNOUNCED") return;

  const isLastRound =
    round.roundNumber === Math.max(...round.drive.rounds.map((r) => r.roundNumber));

  const results = await prisma.roundResult.findMany({
    where: { roundId },
    include: { application: { include: { student: { include: { user: true } } } } },
  });

  const advanceUserIds: number[] = [];
  const selectedUserIds: number[] = [];
  const rejectedUserIds: number[] = [];

  for (const result of results) {
    let status: "SELECTED" | "REJECTED" | "IN_PROGRESS";
    if (result.outcome === "REJECTED" || result.outcome === "ABSENT") {
      status = "REJECTED";
      rejectedUserIds.push(result.application.student.user.id);
    } else if (result.outcome === "SELECTED" || result.outcome === "NEXT_ROUND") {
      // Only the FINAL round marks an application SELECTED — earlier rounds just advance
      status = isLastRound ? "SELECTED" : "IN_PROGRESS";
      if (isLastRound) selectedUserIds.push(result.application.student.user.id);
      else advanceUserIds.push(result.application.student.user.id);
    } else {
      continue; // PENDING
    }

    await prisma.application.update({
      where: { id: result.applicationId },
      data: { applicationStatus: status },
    });
  }

  const company = round.drive.company.companyName;
  if (advanceUserIds.length)
    await notifyUsers(advanceUserIds, `You advance — ${company}`, `You cleared Round ${round.roundNumber} (${round.roundType}). Watch for the next round.`, "/student/applications");
  if (selectedUserIds.length)
    await notifyUsers(selectedUserIds, `Selected! 🎉 — ${company}`, `You cleared the final ${round.roundType}. Your offer is on the way.`, "/student/offers");
  if (rejectedUserIds.length)
    await notifyUsers(rejectedUserIds, `Result published — ${company}`, `Not selected in Round ${round.roundNumber} (${round.roundType}). More drives are open — keep going.`, "/student/drives");

  await prisma.round.update({ where: { id: roundId }, data: { roundStatus: "COMPLETED" } });
  if (isLastRound) {
    await prisma.drive.update({
      where: { id: round.driveId },
      data: { driveStatus: "COMPLETED" },
    });
  }
  revalidatePath(`/admin/drives/${round.driveId}`);
  revalidatePath("/student/applications");
  revalidatePath("/admin");
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

  const exists = await prisma.offer.findUnique({ where: { applicationId } });
  if (exists) return { error: "An offer already exists for this application." };

  await prisma.offer.create({
    data: { applicationId, package: application.drive.package },
  });
  await prisma.application.update({
    where: { id: applicationId },
    data: { applicationStatus: "OFFERED" },
  });
  await notifyUsers(
    [application.student.user.id],
    `Offer from ${application.drive.company.companyName}! 🎉`,
    `${application.drive.jobRole} · ₹${Number(application.drive.package)} LPA — respond in your Offers page.`,
    "/student/offers"
  );
  revalidatePath(`/admin/drives/${application.driveId}`);
  revalidatePath("/student/offers");
  revalidatePath("/admin");
  return { ok: "Offer issued. Dashboard statistics updated." };
}
