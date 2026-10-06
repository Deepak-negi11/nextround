// Form parsing shared by admin user creation and student self sign-up.
// Each parser returns either clean data or one human-readable error.
import { BRANCHES } from "./constants";

export type AccountInput = { name: string; email: string; password: string };
export type StudentInput = AccountInput & {
  rollNo: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  graduationYear: number;
};
export type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

export const MIN_PASSWORD_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
// Strict integer parse: "" and "1.5" are rejected instead of silently becoming 0 / 1.
const int = (fd: FormData, key: string) => (/^\d+$/.test(str(fd, key)) ? Number(str(fd, key)) : NaN);

export function parseAccount(fd: FormData): Parsed<AccountInput> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!name || name.length > 100) return { ok: false, error: "Name is required (max 100 characters)." };
  if (email.length > 254 || !EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (password.length < MIN_PASSWORD_LENGTH)
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  // bcrypt ignores everything after 72 bytes, so reject longer passwords rather than truncate silently
  if (new TextEncoder().encode(password).length > 72)
    return { ok: false, error: "Password is too long (max 72 bytes)." };

  return { ok: true, data: { name, email, password } };
}

export function parseStudent(fd: FormData): Parsed<StudentInput> {
  const account = parseAccount(fd);
  if (!account.ok) return account;

  const rollNo = str(fd, "rollNo");
  const branch = str(fd, "branch");
  const cgpaRaw = str(fd, "cgpa");
  const cgpa = cgpaRaw ? Number(cgpaRaw) : NaN;
  const activeBacklogs = int(fd, "activeBacklogs");
  const graduationYear = int(fd, "graduationYear");

  if (!rollNo || rollNo.length > 40) return { ok: false, error: "Roll number is required (max 40 characters)." };
  if (!BRANCHES.includes(branch)) return { ok: false, error: "Select a valid branch." };
  if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) return { ok: false, error: "CGPA must be between 0 and 10." };
  if (isNaN(activeBacklogs) || activeBacklogs > 50) return { ok: false, error: "Active backlogs must be a whole number (0 or more)." };
  if (isNaN(graduationYear) || graduationYear < 2000 || graduationYear > 2100)
    return { ok: false, error: "Graduation year looks invalid." };

  return { ok: true, data: { ...account.data, rollNo, branch, cgpa, activeBacklogs, graduationYear } };
}

// Self sign-up is limited to college email domains. Configure with
// STUDENT_EMAIL_DOMAINS="college.edu,gehu.ac.in" in .env (default: college.edu).
export function allowedStudentDomains(): string[] {
  return (process.env.STUDENT_EMAIL_DOMAINS ?? "college.edu")
    .split(",")
    .map((d) => d.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

export function isAllowedStudentEmail(email: string): boolean {
  const domain = email.toLowerCase().split("@").pop() ?? "";
  return allowedStudentDomains().includes(domain);
}
