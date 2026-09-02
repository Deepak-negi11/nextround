import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Badge, PageHeader, STATUS_TONE, pretty } from "@/components/ui";
import OutcomeForm from "./OutcomeForm";

export default async function InterviewerRound({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("INTERVIEWER");
  const round = await prisma.round.findUnique({
    where: { id: parseInt(id) },
    include: {
      drive: { include: { company: true } },
      panelists: true,
      slots: { include: { bookedByApplication: { include: { student: { include: { user: true } } } } } },
      results: true,
    },
  });
  if (!round) notFound();

  // Only assigned panelists can open this page
  if (!round.panelists.some((p) => p.interviewerId === user.id)) notFound();

  // Candidates = active applications on this drive
  const candidates = await prisma.application.findMany({
    where: {
      driveId: round.driveId,
      applicationStatus: { in: ["APPLIED", "IN_PROGRESS", "SELECTED"] },
    },
    include: { student: { include: { user: true } }, results: { where: { roundId: round.id } } },
    orderBy: { appliedAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/interviewer" className="text-sm text-brand-600 hover:text-brand-700 hover:underline">← My rounds</Link>

      <PageHeader
        title={`${round.drive.company.companyName} — ${round.drive.jobRole}`}
        subtitle={`Round ${round.roundNumber}: ${round.roundType} · ${pretty(round.mode)} · ${pretty(round.roundStatus)}`}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Candidates ({candidates.length})</h2>
        {candidates.length === 0 && <p className="text-sm text-slate-500">No candidates in this round yet.</p>}
        {candidates.map((app) => {
          const existing = app.results[0];
          const slot = round.slots.find((s) => s.bookedByApplicationId === app.id);
          return (
            <article key={app.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{app.student.user.name}</h3>
                  <p className="text-xs text-slate-400">
                    {app.student.rollNo} · {app.student.branch} · CGPA {app.student.cgpa.toFixed(2)} · {app.student.activeBacklogs} backlog(s)
                  </p>
                  {app.student.resumeLink && (
                    <a href={app.student.resumeLink} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-brand-600 hover:text-brand-700 hover:underline">📄 Résumé</a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {slot && <Badge tone="indigo">Slot: {new Date(slot.startAt).toLocaleString()}</Badge>}
                  {existing && <Badge tone={STATUS_TONE[existing.outcome]}>Recorded: {pretty(existing.outcome)}</Badge>}
                </div>
              </div>
              <OutcomeForm
                applicationId={app.id}
                roundId={round.id}
                initial={{
                  outcome: existing?.outcome ?? "SELECTED",
                  score: existing?.score?.toString() ?? "",
                  rank: existing?.rank?.toString() ?? "",
                  remarks: existing?.remarks ?? "",
                }}
              />
            </article>
          );
        })}
      </section>
    </div>
  );
}
