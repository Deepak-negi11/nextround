"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, homeFor, verifyCredentials } from "@/lib/auth";
import { createStudentAccount } from "@/lib/accounts";
import { DB_UNAVAILABLE_MESSAGE, isDbUnavailable } from "@/lib/db-errors";
import { allowedStudentDomains, isAllowedStudentEmail, parseStudent } from "@/lib/validation";

// `email` / `values` echo the submitted (non-secret) fields so a failed submit doesn't wipe the form.
export type LoginState = { error?: string; email?: string; values?: Record<string, string> };

const REGISTER_FIELDS = ["name", "email", "rollNo", "enrollmentNo", "branch", "cgpa", "activeBacklogs", "graduationYear"];

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required.", email };

  let user;
  try {
    user = await verifyCredentials(email, password);
  } catch (e) {
    if (isDbUnavailable(e)) return { error: DB_UNAVAILABLE_MESSAGE, email };
    throw e;
  }
  if (!user) return { error: "Invalid email or password.", email };

  await createSession(user);
  redirect(homeFor(user.role));
}

// Student self sign-up. The role is always STUDENT — never read from the form —
// so nobody can register themselves as an admin or interviewer.
export async function register(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const values = Object.fromEntries(REGISTER_FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));
  const fail = (error: string): LoginState => ({ error, values });

  const parsed = parseStudent(formData);
  if (!parsed.ok) return fail(parsed.error);

  if (String(formData.get("confirmPassword") ?? "") !== parsed.data.password)
    return fail("Passwords do not match.");

  if (!isAllowedStudentEmail(parsed.data.email)) {
    const domains = allowedStudentDomains().map((d) => `@${d}`).join(", ");
    return fail(`Sign up with your college email (${domains}).`);
  }

  let result;
  try {
    result = await createStudentAccount(parsed.data);
  } catch (e) {
    if (isDbUnavailable(e)) return fail(DB_UNAVAILABLE_MESSAGE);
    throw e;
  }
  if (!result.ok) return fail(result.error);

  await createSession(result.user);
  redirect("/student");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
