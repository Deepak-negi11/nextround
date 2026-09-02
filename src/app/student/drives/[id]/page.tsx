import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { checkEligibility } from "@/lib/eligibility";
import { applyToDrive } from "@/actions/student";
import { Badge, PageHeader, pretty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export default async function DriveDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({ where: { userId: user.id }, include: { applications: true } });
  const drive = await prisma.drive.findUnique({
    where: { id: parseInt(id) },
    include: { company: true, eligibilityRule: true, branches: true, rounds: { orderBy: { roundNumber: "asc" } } },
  });
  if (!student || !drive) notFound();

  const rules = {
    minimumCgpa: drive.eligibilityRule?.minimumCgpa ?? 0,
    maximumBacklogs: drive.eligibilityRule?.maximumBacklogs ?? 0,
    branches: drive.branches.map((b) => b.branchName),
  };
  const { eligible, reasons } = checkEligibility(student, rules);
  const applied = student.applications.some((a) => a.driveId === drive.id);
  const fmt = (d: Date | null) => (d ? new Date(d).toLocaleString() : "TBA");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/student/drives" className="text-sm text-brand-600 hover:text-brand-700 hover:underline">← All drives</Link>

      <PageHeader
        title={drive.company.companyName}
        subtitle={`${drive.jobRole} · ₹${Number(drive.package)} LPA · Apply by ${new Date(drive.applicationDeadline).toLocaleDateString()}`}
        actions={
          applied ? (
            <Badge tone="green">Applied ✓</Badge>
          ) : eligible && drive.driveStatus === "PUBLISHED" ? (
            <form action={applyToDrive}>
              <input type="hidden" name="driveId" value={drive.id} />
              <SubmitButton>Apply to this drive</SubmitButton>
            </form>
          ) : (
            <Badge tone="red">Not eligible</Badge>
          )
        }
      />

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {drive.description && <p className="text-sm leading-6 text-slate-600">{drive.description}</p>}
        {!eligible && !applied && (
          <ul className="mt-4 space-y-1 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            {reasons.map((r) => <li key={r}>• {r}</li>)}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold">Eligibility rules</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {rules.branches.map((b) => <Badge key={b} tone="blue">{b}</Badge>)}
          <Badge tone="violet">CGPA ≥ {rules.minimumCgpa.toFixed(1)}</Badge>
          <Badge tone="amber">≤ {rules.maximumBacklogs} active backlog(s)</Badge>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold">Selection rounds</h2>
        {drive.rounds.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Rounds will be announced by the placement cell.</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {drive.rounds.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">Round {r.roundNumber} · {r.roundType}</p>
                  <div className="flex gap-2">
                    <Badge tone={r.mode === "ONLINE" ? "blue" : "amber"}>{pretty(r.mode)}</Badge>
                    {r.roundStatus === "ANNOUNCED" && <Badge tone="green">Announced</Badge>}
                    {r.roundStatus === "COMPLETED" && <Badge tone="slate">Completed</Badge>}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{fmt(r.startAt)} → {fmt(r.endAt)}</p>
                {r.roundStatus !== "ANNOUNCED" && r.roundStatus !== "COMPLETED" ? (
                  <p className="mt-2 text-xs text-slate-400">Details visible once the round is announced.</p>
                ) : (
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    {r.mode === "ONLINE" ? (
                      <>
                        {r.meetingLink && <p>🔗 <a className="text-brand-600 hover:text-brand-700 hover:underline" href={r.meetingLink} target="_blank" rel="noreferrer">{r.meetingLink}</a></p>}
                        {r.instructions && <p>📋 {r.instructions}</p>}
                      </>
                    ) : (
                      <>
                        {r.venue && <p>📍 {r.venue}{r.building ? `, ${r.building}` : ""}{r.roomNumber ? ` — Room ${r.roomNumber}` : ""}</p>}
                        {r.reportingTime && <p>⏰ Report by {r.reportingTime}</p>}
                      </>
                    )}
                    {r.resultDate && <p>🗓 Results on {new Date(r.resultDate).toLocaleDateString()}</p>}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
