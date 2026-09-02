import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Badge, PageHeader, STATUS_TONE, pretty } from "@/components/ui";

export default async function InterviewerHome() {
  const user = await requireRole("INTERVIEWER");
  const assignments = await prisma.roundPanelist.findMany({
    where: { interviewerId: user.id },
    include: {
      round: {
        include: {
          drive: { include: { company: true } },
          _count: { select: { results: true, slots: true } },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="My interview rounds" subtitle="View assigned candidates and record interview outcomes." />

      <div className="grid gap-4">
        {assignments.map(({ round }) => (
          <Link key={round.id} href={`/interviewer/rounds/${round.id}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">{round.drive.company.companyName} — {round.drive.jobRole}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Round {round.roundNumber}: {round.roundType} · {pretty(round.mode)}
                  {round.startAt && ` · ${new Date(round.startAt).toLocaleString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="slate">{round._count.results} outcome(s) recorded</Badge>
                <Badge tone={STATUS_TONE[round.roundStatus] ?? "slate"}>{pretty(round.roundStatus)}</Badge>
              </div>
            </div>
          </Link>
        ))}
        {assignments.length === 0 && (
          <p className="text-sm text-slate-500">No rounds assigned to you yet. The placement admin assigns interviewers per round.</p>
        )}
      </div>
    </div>
  );
}
