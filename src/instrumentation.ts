// Runs once when the Next.js server boots. With a remote database (Supabase in another region),
// opening a connection costs several seconds, and Prisma opens pool connections lazily — so the
// first pages that run queries in parallel would each pay that cost. Open the whole pool up front.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { prisma } = await import("@/lib/prisma");

  // Match the pool size set in DATABASE_URL (?connection_limit=N); fall back to a small default.
  const limit = Number(new URL(process.env.DATABASE_URL ?? "postgresql://x").searchParams.get("connection_limit")) || 3;
  const started = Date.now();
  // One query per pool slot, in parallel, forces Prisma to open every connection now.
  Promise.all(Array.from({ length: limit }, () => prisma.$queryRaw`SELECT 1`))
    .then(() => console.log(`[db] ${limit} connection(s) ready in ${Date.now() - started}ms`))
    .catch((e: unknown) => console.error("[db] warm-up failed:", e instanceof Error ? e.message : e));
}
