"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { parseAccount, parseStudent } from "@/lib/validation";
import { createInterviewerAccount, createStudentAccount } from "@/lib/accounts";

export type ActionState = { error?: string; ok?: string };

function refreshUserViews() {
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
}

// Admin-created accounts skip the email-domain rule used by self sign-up
// (e.g. recruiters use their company email).
export async function createStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseStudent(formData);
  if (!parsed.ok) return { error: parsed.error };

  const result = await createStudentAccount(parsed.data);
  if (!result.ok) return { error: result.error };

  refreshUserViews();
  return { ok: `Student ${result.user.name} added. Share their email and password with them.` };
}

export async function createInterviewer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseAccount(formData);
  if (!parsed.ok) return { error: parsed.error };

  const result = await createInterviewerAccount(parsed.data);
  if (!result.ok) return { error: result.error };

  refreshUserViews();
  revalidatePath("/admin/rounds/[id]", "page"); // panelist dropdowns list interviewers
  return { ok: `Interviewer ${result.user.name} added. You can now assign them to rounds.` };
}
