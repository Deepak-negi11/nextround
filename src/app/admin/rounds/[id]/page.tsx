import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Badge, Card, STATUS_TONE, pretty } from "@/components/ui";
import SlotForm from "./SlotForm";
import PanelistForm from "./PanelistForm";
import { AnnounceForm, ResultsForm, ShortlistForm, type Candidate } from "./RoundForms";

export default async function RoundManage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("ADMIN");
  const roundId = parseInt(id);
  const [round, interviewers, applicants] = await Promise.all([
    prisma.round.findUnique({
      where: { id: roundId },
      include: {
        drive: { include: { company: true, rounds: { select: { id: true, roundNumber: true }, orderBy: { roundNumber: "asc" } } } },
        slots: { orderBy: { startAt: "asc" }, include: { bookedByApplication: { include: { student: { include: { user: true } } } } } },
        panelists: { include: { interviewer: true } },
        results: { include: { application: { include: { student: { include: { user: true } } } } } },
      },
    }),
    prisma.user.findMany({
      where: { role: "INTERVIEWER" },
      orderBy: { name: "asc" },
    }),
    // Students still in this drive: applied (not yet shortlisted) or in the running.
    prisma.application.findMany({
      where: { drive: { rounds: { some: { id: roundId } } }, applicationStatus: { in: ["APPLIED", "IN_PROGRESS"] } },
      include: { student: { include: { user: true } } },
      orderBy: { appliedAt: "asc" },
    }),
  ]);
  if (!round) notFound();

  const isFirstRound = round.drive.rounds[0]?.id === round.id;
  const laterRoundExists = round.drive.rounds.some((r) => r.roundNumber > round.roundNumber);
  const passedByInterviewer = new Set(
    round.results.filter((r) => r.outcome === "SELECTED" || r.outcome === "NEXT_ROUND").map((r) => r.applicationId)
  );
  const toCandidate = (a: (typeof applicants)[number], checked: boolean): Candidate => ({
    applicationId: a.id,
    name: a.student.user.name,
    rollNo: a.student.rollNo,
    branch: a.student.branch,
    cgpa: a.student.cgpa,
    backlogs: a.student.activeBacklogs,
    resumeLink: a.student.resumeLink,
    checked,
  });
  const inRunning = applicants.filter((a) => a.applicationStatus === "IN_PROGRESS");
  const clearedCount = round.results.filter((r) => r.outcome === "SELECTED" || r.outcome === "NEXT_ROUND").length;
  const exportHref = `/admin/drives/${round.driveId}/export?only=active`;

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
            {round.roundStatus === "SCHEDULED" && <AnnounceForm roundId={round.id} />}
          </div>
        </div>
        {/* Persistent status line: a form's own success message disappears once the round moves on. */}
        {round.roundStatus === "ANNOUNCED" && (
          <p role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            📣 Announced to {inRunning.length} student{inRunning.length === 1 ? "" : "s"}. When the company sends who cleared this round, enter it below.
          </p>
        )}
        {round.roundStatus === "COMPLETED" && (
          <p role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            ✅ Results published: {clearedCount} cleared, {round.results.length - clearedCount} not selected.{" "}
            {round.drive.driveStatus === "COMPLETED" ? (
              <Link href={`/admin/drives/${round.driveId}`} className="font-medium underline">Issue offers on the drive page →</Link>
            ) : (
              <Link href={`/admin/drives/${round.driveId}`} className="font-medium underline">Add or announce the next round →</Link>
            )}
          </p>
        )}
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

      {/* The selection flow: company shortlists → admin enters it → announce → company sends who cleared → publish */}
      {round.roundStatus === "SCHEDULED" && isFirstRound && (
        <Card
          title={`Shortlist for Round ${round.roundNumber} (${applicants.length} applicant${applicants.length === 1 ? "" : "s"})`}
          actions={<a href={exportHref} className="text-xs font-medium text-brand-600 hover:underline">Download for company (CSV)</a>}
        >
          <ShortlistForm
            roundId={round.id}
            roundNumber={round.roundNumber}
            candidates={applicants.map((a) => toCandidate(a, a.applicationStatus === "IN_PROGRESS"))}
          />
        </Card>
      )}
      {round.roundStatus === "SCHEDULED" && !isFirstRound && (
        <Card title={`Students in this round (${inRunning.length})`}>
          <p className="text-sm text-slate-600">
            These students cleared the previous round. Announce this round to send them its date and details.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {inRunning.map((a) => <li key={a.id}><Badge tone="blue">{a.student.user.name}</Badge></li>)}
            {inRunning.length === 0 && <p className="text-sm text-slate-500">Nobody yet — publish the previous round&apos;s results first.</p>}
          </ul>
        </Card>
      )}
      {round.roundStatus === "ANNOUNCED" && (
        <Card
          title={`Enter results from the company (${inRunning.length} in this round)`}
          actions={<a href={exportHref} className="text-xs font-medium text-brand-600 hover:underline">Download for company (CSV)</a>}
        >
          <ResultsForm
            roundId={round.id}
            roundNumber={round.roundNumber}
            laterRoundExists={laterRoundExists}
            candidates={inRunning.map((a) => toCandidate(a, passedByInterviewer.has(a.id)))}
          />
        </Card>
      )}

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
