import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { announceRound, publishRoundResults } from "@/actions/admin";
import { Badge, Card, STATUS_TONE, pretty } from "@/components/ui";
import SlotForm from "./SlotForm";
import PanelistForm from "./PanelistForm";

export default async function RoundManage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("ADMIN");
  const round = await prisma.round.findUnique({
    where: { id: parseInt(id) },
    include: {
      drive: { include: { company: true } },
      slots: { orderBy: { startAt: "asc" }, include: { bookedByApplication: { include: { student: { include: { user: true } } } } } },
      panelists: { include: { interviewer: true } },
      results: { include: { application: { include: { student: { include: { user: true } } } } } },
    },
  });
  if (!round) notFound();

  const interviewers = await prisma.user.findMany({
    where: { role: "INTERVIEWER" },
    orderBy: { name: "asc" },
  });

  const isInterview = /interview/i.test(round.roundType);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href={`/admin/drives/${round.driveId}`} className="text-sm text-brand-600 hover:underline">← {round.drive.company.companyName} drive</Link>

      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Round {round.roundNumber}: {round.roundType}</h1>
              <Badge tone={STATUS_TONE[round.roundStatus] ?? "slate"}>{pretty(round.roundStatus)}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {pretty(round.mode)} · {round.startAt ? new Date(round.startAt).toLocaleString() : "TBA"}
              {round.resultDate && ` · results ${new Date(round.resultDate).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex gap-2">
            {round.roundStatus === "SCHEDULED" && (
              <form action={announceRound}>
                <input type="hidden" name="roundId" value={round.id} />
                <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500">📣 Announce to students</button>
              </form>
            )}
            {round.roundStatus === "ANNOUNCED" && (
              <form action={publishRoundResults}>
                <input type="hidden" name="roundId" value={round.id} />
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
                  ✅ Publish results ({round.results.length} recorded)
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-slate-500">
          {round.mode === "ONLINE" ? (
            <>
              {round.meetingLink && <p>🔗 <a className="text-brand-600 hover:underline" href={round.meetingLink}>{round.meetingLink}</a></p>}
              {round.instructions && <p>📋 {round.instructions}</p>}
            </>
          ) : (
            <p>📍 {[round.venue, round.building, round.roomNumber && `Room ${round.roomNumber}`].filter(Boolean).join(", ")} {round.reportingTime && `· report by ${round.reportingTime}`}</p>
          )}
        </div>
      </header>

      {isInterview && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title={`Interview slots (${round.slots.length})`}>
            <ul className="divide-y divide-slate-100">
              {round.slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{new Date(s.startAt).toLocaleString()} → {new Date(s.endAt).toLocaleTimeString()}</span>
                  {s.bookedByApplication ? (
                    <Badge tone="green">{s.bookedByApplication.student.user.name} booked</Badge>
                  ) : (
                    <Badge tone="slate">Open</Badge>
                  )}
                </li>
              ))}
              {round.slots.length === 0 && <p className="text-sm text-slate-500">No slots yet.</p>}
            </ul>
            <SlotForm roundId={round.id} />
          </Card>

          <Card title="Assigned interviewers">
            <ul className="mb-4 flex flex-wrap gap-2">
              {round.panelists.map((p) => (
                <li key={p.id}><Badge tone="indigo">{p.interviewer.name}</Badge></li>
              ))}
              {round.panelists.length === 0 && <p className="text-sm text-slate-500">No interviewers assigned — assign one so they can record outcomes.</p>}
            </ul>
            <PanelistForm roundId={round.id} interviewers={interviewers.map((i) => ({ id: i.id, name: i.name }))} />
          </Card>
        </div>
      )}

      <Card title={`Recorded outcomes (${round.results.length})`}>
        {round.results.length === 0 ? (
          <p className="text-sm text-slate-500">
            No outcomes recorded yet. {round.panelists.length > 0
              ? "Assigned interviewers record outcomes from their portal."
              : "Assign an interviewer first (for interview rounds), or outcomes appear here once recorded."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2">Student</th><th className="pb-2">Outcome</th><th className="pb-2">Score</th><th className="pb-2">Rank</th><th className="pb-2">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {round.results.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 font-medium">{r.application.student.user.name}</td>
                  <td className="py-2.5"><Badge tone={STATUS_TONE[r.outcome]}>{pretty(r.outcome)}</Badge></td>
                  <td className="py-2.5">{r.score ?? "—"}</td>
                  <td className="py-2.5">{r.rank ?? "—"}</td>
                  <td className="py-2.5 text-slate-500">{r.remarks ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
