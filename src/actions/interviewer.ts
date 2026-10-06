"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type ActionState = { error?: string; ok?: string };

// Interviewer/Recruiter records the outcome for one candidate in one round:
// Selected | Rejected | NextRound | Absent (+ score, rank, remarks)
export async function recordResult(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("INTERVIEWER");
  const applicationId = parseInt(String(formData.get("applicationId")));
  const roundId = parseInt(String(formData.get("roundId")));
  const outcome = String(formData.get("outcome")) as "SELECTED" | "REJECTED" | "NEXT_ROUND" | "ABSENT";
  const scoreRaw = String(formData.get("score") ?? "").trim();
  const rankRaw = String(formData.get("rank") ?? "").trim();
  const remarks = String(formData.get("remarks") || "").trim() || null;

  if (!Number.isInteger(applicationId) || !Number.isInteger(roundId)) return { error: "Invalid request." };
  if (!["SELECTED", "REJECTED", "NEXT_ROUND", "ABSENT"].includes(outcome))
    return { error: "Invalid outcome." };

  // Only assigned panelists may record results for this round
  const assignment = await prisma.roundPanelist.findUnique({
    where: { roundId_interviewerId: { roundId, interviewerId: user.id } },
  });
  if (!assignment) return { error: "You are not assigned to this round." };

  // The candidate must belong to this round's drive and still be in the running,
  // otherwise a crafted request could write results for any application.
  const [round, application] = await Promise.all([
    prisma.round.findUnique({ where: { id: roundId }, select: { driveId: true, roundStatus: true } }),
    prisma.application.findUnique({ where: { id: applicationId }, select: { driveId: true, applicationStatus: true } }),
  ]);
  if (!round || !application || application.driveId !== round.driveId)
    return { error: "This candidate is not part of this round's drive." };
  if (round.roundStatus === "COMPLETED")
    return { error: "Results for this round are already published and can't be changed." };
  if (!["APPLIED", "IN_PROGRESS", "SELECTED"].includes(application.applicationStatus))
    return { error: "This candidate is no longer active in the drive." };

  const score = scoreRaw ? parseFloat(scoreRaw) : null;
  const rank = rankRaw ? parseInt(rankRaw) : null;
  if (score !== null && (isNaN(score) || score < 0)) return { error: "Score must be a positive number." };
  if (rank !== null && (isNaN(rank) || rank < 1)) return { error: "Rank must be 1 or more." };

  await prisma.roundResult.upsert({
    where: { applicationId_roundId: { applicationId, roundId } },
    create: { applicationId, roundId, outcome, score, rank, remarks, recordedById: user.id },
    update: { outcome, score, rank, remarks, recordedById: user.id },
  });

  revalidatePath(`/interviewer/rounds/${roundId}`);
  revalidatePath(`/admin/rounds/${roundId}`);
  return { ok: "Outcome recorded." };
}
