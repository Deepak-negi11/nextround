"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { checkEligibility } from "@/lib/eligibility";

export type ActionState = { error?: string; ok?: string };

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("STUDENT");
  const cgpa = parseFloat(String(formData.get("cgpa")));
  const activeBacklogs = parseInt(String(formData.get("activeBacklogs")));
  const branch = String(formData.get("branch")).trim();
  const graduationYear = parseInt(String(formData.get("graduationYear")));
  const resumeLink = String(formData.get("resumeLink") || "").trim() || null;

  if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) return { error: "CGPA must be between 0 and 10." };
  if (isNaN(activeBacklogs) || activeBacklogs < 0) return { error: "Backlogs must be 0 or more." };
  if (!branch) return { error: "Branch is required." };

  await prisma.student.update({
    where: { userId: user.id },
    data: { cgpa, activeBacklogs, branch, graduationYear, resumeLink },
  });
  revalidatePath("/student/profile");
  revalidatePath("/student/drives");
  return { ok: "Profile updated." };
}

export async function applyToDrive(formData: FormData) {
  const user = await requireRole("STUDENT");
  const driveId = parseInt(String(formData.get("driveId")));

  const student = await prisma.student.findUnique({ where: { userId: user.id } });
  const drive = await prisma.drive.findUnique({
    where: { id: driveId },
    include: { eligibilityRule: true, branches: true },
  });
  if (!student || !drive) return;
  if (drive.driveStatus !== "PUBLISHED") return;

  // Campus policy: a student holding an accepted offer is placed and stops applying
  const acceptedOffer = await prisma.offer.findFirst({
    where: { offerStatus: "ACCEPTED", application: { studentId: student.id } },
  });
  if (acceptedOffer) return;

  // Applications close at the deadline — enforced server-side, not just shown in the UI
  if (drive.applicationDeadline.getTime() < Date.now()) return;

  // Server-side eligibility gate — the same rule shown in the UI
  const { eligible } = checkEligibility(student, {
    minimumCgpa: drive.eligibilityRule?.minimumCgpa ?? 0,
    maximumBacklogs: drive.eligibilityRule?.maximumBacklogs ?? 0,
    branches: drive.branches.map((b) => b.branchName),
  });
  if (!eligible) return;

  // Duplicate applications blocked by the DB unique constraint
  await prisma.application
    .create({ data: { studentId: student.id, driveId } })
    .catch(() => null);

  revalidatePath("/student/drives");
  revalidatePath(`/student/drives/${driveId}`);
  revalidatePath("/student/applications");
}

export async function bookSlot(formData: FormData) {
  const user = await requireRole("STUDENT");
  const slotId = parseInt(String(formData.get("slotId")));

  const student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) return;

  const slot = await prisma.interviewSlot.findUnique({
    where: { id: slotId },
    include: { round: { include: { drive: true } } },
  });
  if (!slot) return;
  // Slots exist only for announced rounds of live drives
  if (slot.round.roundStatus !== "ANNOUNCED") return;
  if (slot.round.drive.driveStatus !== "PUBLISHED") return;

  const app = await prisma.application.findUnique({
    where: { studentId_driveId: { studentId: student.id, driveId: slot.round.driveId } },
  });
  // Only students still in the running can pick a slot
  if (!app || !["APPLIED", "IN_PROGRESS"].includes(app.applicationStatus)) return;

  // One slot per round — booking the next round's slot must still work
  const existing = await prisma.interviewSlot.findFirst({
    where: { roundId: slot.roundId, bookedByApplicationId: app.id },
  });
  if (existing) return;

  // Atomic claim: the update only lands if the slot is still free, so two students
  // clicking at the same time can never double-book the same slot
  const claimed = await prisma.interviewSlot.updateMany({
    where: { id: slotId, bookedByApplicationId: null },
    data: { bookedByApplicationId: app.id },
  });
  if (claimed.count === 0) return;

  revalidatePath("/student/applications");
}

export async function respondToOffer(formData: FormData) {
  const user = await requireRole("STUDENT");
  const offerId = parseInt(String(formData.get("offerId")));
  const accept = String(formData.get("accept")) === "1";

  const student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) return;

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { application: true },
  });
  if (!offer || offer.application.studentId !== student.id) return;
  if (offer.offerStatus !== "ISSUED") return;

  await prisma.offer.update({
    where: { id: offerId },
    data: { offerStatus: accept ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
  });
  await prisma.application.update({
    where: { id: offer.applicationId },
    data: { applicationStatus: accept ? "OFFER_ACCEPTED" : "OFFER_DECLINED" },
  });

  revalidatePath("/student/offers");
  revalidatePath("/student");
}
