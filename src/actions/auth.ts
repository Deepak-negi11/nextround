"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, homeFor, verifyCredentials } from "@/lib/auth";
import { createStudentAccount } from "@/lib/accounts";
import { allowedStudentDomains, isAllowedStudentEmail, parseStudent } from "@/lib/validation";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const user = await verifyCredentials(email, password);
  if (!user) return { error: "Invalid email or password." };

  await createSession(user);
  redirect(homeFor(user.role));
}

// Student self sign-up. The role is always STUDENT — never read from the form —
// so nobody can register themselves as an admin or interviewer.
export async function register(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = parseStudent(formData);
  if (!parsed.ok) return { error: parsed.error };

  if (String(formData.get("confirmPassword") ?? "") !== parsed.data.password)
    return { error: "Passwords do not match." };

  if (!isAllowedStudentEmail(parsed.data.email)) {
    const domains = allowedStudentDomains().map((d) => `@${d}`).join(", ");
    return { error: `Sign up with your college email (${domains}).` };
  }

  const result = await createStudentAccount(parsed.data);
  if (!result.ok) return { error: result.error };

  await createSession(result.user);
  redirect("/student");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
