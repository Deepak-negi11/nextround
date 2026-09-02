import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { bookSlot } from "@/actions/student";
import { Badge, PageHeader, STATUS_TONE, pretty } from "@/components/ui";

const fmt = (d: Date | null) => (d ? new Date(d).toLocaleString() : "TBA");

export default async function ApplicationsPage() {
  const user = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      applications: {
        include: {
          drive: { include: { company: true, rounds: { orderBy: { roundNumber: "asc" }, include: { slots: true } } } },
          results: { include: { round: true } },
          slots: { include: { round: true } },
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
  if (!student) return <p>No student profile found.</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="My applications" subtitle="Track every round, result and interview slot in one place." />

      {student.applications.length === 0 && <p className="text-sm text-slate-500">Nothing yet — browse open drives.</p>}

      {student.applications.map((app) => {
        const activeRound = app.drive.rounds.find((r) => r.roundStatus === "ANNOUNCED");
        const mySlot = app.slots[0];
        const isInterview = activeRound && /interview/i.test(activeRound.roundType);
        const needsSlot = isInterview && !mySlot;

        return (
          <article key={app.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">{app.drive.company.companyName} — {app.drive.jobRole}</h2>
                <p className="text-xs text-slate-400">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
              </div>
              <Badge tone={STATUS_TONE[app.applicationStatus]}>{pretty(app.applicationStatus)}</Badge>
            </div>

            <ol className="mt-4 space-y-2">
              {app.drive.rounds.map((r) => {
                const result = app.results.find((res) => res.roundId === r.id);
                return (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">R{r.roundNumber}: {r.roundType}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {r.mode === "ONLINE" ? "Online" : "Offline"} · {fmt(r.startAt)}
                      </span>
                    </div>
                    {result ? (
                      <div className="flex items-center gap-2">
                        <Badge tone={STATUS_TONE[result.outcome]}>{pretty(result.outcome)}</Badge>
                        {result.score != null && <span className="text-xs text-slate-500">Score {result.score}{result.rank ? ` · Rank ${result.rank}` : ""}</span>}
                        {result.remarks && <span className="text-xs italic text-slate-400">“{result.remarks}”</span>}
                      </div>
                    ) : (
                      <Badge tone="slate">{r.roundStatus === "COMPLETED" ? "Awaited" : "Pending"}</Badge>
                    )}
                  </li>
                );
              })}
              {app.drive.rounds.length === 0 && <p className="text-xs text-slate-400">Rounds not announced yet.</p>}
            </ol>

            {mySlot && (
              <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                📅 Your {mySlot.round.roundType} slot: {fmt(mySlot.startAt)} → {new Date(mySlot.endAt).toLocaleTimeString()} {mySlot.venue ? `at ${mySlot.venue}` : ""}
              </p>
            )}

            {needsSlot && activeRound && (
              <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50/50 p-4">
                <p className="text-sm font-medium text-brand-900">Pick your {activeRound.roundType} slot</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeRound.slots.map((s) => (
                    <form key={s.id} action={bookSlot}>
                      <input type="hidden" name="slotId" value={s.id} />
                      <button
                        disabled={!!s.bookedByApplicationId}
                        className="rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {new Date(s.startAt).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                        {s.bookedByApplicationId ? " · taken" : ""}
                      </button>
                    </form>
                  ))}
                  {activeRound.slots.length === 0 && <p className="text-xs text-brand-700">Slots will appear here once the admin publishes them.</p>}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
