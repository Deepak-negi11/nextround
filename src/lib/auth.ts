import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const COOKIE = "nextround_session";

// Sessions are HMAC-signed with AUTH_SECRET. A missing or short secret would let anyone forge a
// session (including an admin one), so refuse to sign or verify without a strong one.
// Checked lazily so `next build` doesn't need the secret.
let secretKey: Uint8Array | null = null;
function secret(): Uint8Array {
  if (secretKey) return secretKey;
  const raw = process.env.AUTH_SECRET ?? "";
  if (raw.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters (openssl rand -base64 32).");
  }
  secretKey = new TextEncoder().encode(raw);
  return secretKey;
}

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN" | "INTERVIEWER";
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS-only once deployed
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: payload.id as number,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as SessionUser["role"],
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: SessionUser["role"]): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) redirect(homeFor(user.role));
  return user;
}

export function homeFor(role: SessionUser["role"]) {
  if (role === "ADMIN") return "/admin";
  if (role === "INTERVIEWER") return "/interviewer";
  return "/student";
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;
  const bcrypt = await import("bcryptjs");
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role } as SessionUser;
}
