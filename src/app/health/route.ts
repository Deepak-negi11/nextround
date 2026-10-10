import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Liveness + database check. Handy for confirming a new DATABASE_URL (e.g. Supabase) works.
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      app: "nextround",
      database: { status: "ok", latencyMs: Date.now() - started },
      time: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[health] database check failed:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { status: "degraded", app: "nextround", database: { status: "unreachable" }, time: new Date().toISOString() },
      { status: 503 },
    );
  }
}
