// Runs once when the Next.js server boots. With a remote database (Supabase in another region),
// opening a connection costs several seconds, and Prisma opens pool connections lazily — so the
// first pages that run queries in parallel would each pay that cost. Open the whole pool up front.
//
// This is an optimisation only: nothing in here may throw. A failure in the instrumentation hook
// stops Next.js from serving *any* page, including ones that never touch the database.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { prisma } = await import("@/lib/prisma");
    const limit = poolSize(process.env.DATABASE_URL);
    const started = Date.now();
    // One query per pool slot, in parallel, forces Prisma to open every connection now.
    Promise.all(Array.from({ length: limit }, () => prisma.$queryRaw`SELECT 1`))
      .then(() => console.log(`[db] ${limit} connection(s) ready in ${Date.now() - started}ms`))
      .catch((e: unknown) => console.error("[db] warm-up failed:", describe(e)));
  } catch (e) {
    console.error("[db] warm-up skipped:", describe(e));
  }
}

// Reads ?connection_limit=N from the database URL. Never throws, and never echoes the URL
// (it contains the database password).
function poolSize(url: string | undefined): number {
  const match = /[?&]connection_limit=(\d+)/.exec(url ?? "");
  const n = match ? Number(match[1]) : NaN;
  return Number.isInteger(n) && n > 0 && n <= 20 ? n : 3;
}

// Error text without anything that looks like a connection string.
function describe(e: unknown): string {
  const text = e instanceof Error ? e.message : String(e);
  return text.replace(/postgres(?:ql)?:\/\/\S+/gi, "<database url>");
}
