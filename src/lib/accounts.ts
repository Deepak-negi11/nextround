// Account creation used by both the admin console and student self sign-up.
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { SessionUser } from "./auth";
import type { AccountInput, StudentInput } from "./validation";

type Result = { ok: true; user: SessionUser } | { ok: false; error: string };

// Turn unique-constraint violations into friendly messages. Relying on the DB constraint
// (instead of a "check then insert") also covers two sign-ups racing for the same email.
function duplicateMessage(e: unknown): string | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    const target = String(e.meta?.target ?? "");
    if (target.includes("rollNo")) return "That roll number is already registered.";
    return "An account with that email already exists.";
  }
  return null;
}

export async function createStudentAccount(input: StudentInput): Promise<Result> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    // Nested create runs in one transaction: no User is left behind without its Student row.
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: "STUDENT",
        student: {
          create: {
            rollNo: input.rollNo,
            branch: input.branch,
            cgpa: input.cgpa,
            activeBacklogs: input.activeBacklogs,
            graduationYear: input.graduationYear,
          },
        },
      },
    });
    return { ok: true, user: { id: user.id, email: user.email, name: user.name, role: "STUDENT" } };
  } catch (e) {
    const message = duplicateMessage(e);
    if (message) return { ok: false, error: message };
    throw e;
  }
}

export async function createInterviewerAccount(input: AccountInput): Promise<Result> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, passwordHash, role: "INTERVIEWER" },
    });
    return { ok: true, user: { id: user.id, email: user.email, name: user.name, role: "INTERVIEWER" } };
  } catch (e) {
    const message = duplicateMessage(e);
    if (message) return { ok: false, error: message };
    throw e;
  }
}
