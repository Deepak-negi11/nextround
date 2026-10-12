import LoginForm, { type DemoAccount } from "./LoginForm";

// One-click demo logins for the accounts created by prisma/seed.ts. Shown only in development:
// on a deployed site they would let anyone sign in as the admin.
const DEMO: DemoAccount[] = [
  { role: "Placement Admin", email: "admin@college.edu", password: "admin123" },
  { role: "Interviewer", email: "interviewer@college.edu", password: "int123" },
  { role: "Student", email: "student@college.edu", password: "student123" },
];

export default function LoginPage() {
  return <LoginForm demo={process.env.NODE_ENV === "production" ? [] : DEMO} />;
}
