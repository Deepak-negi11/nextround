import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { checkEligibility } from "@/lib/eligibility";
import { applyToDrive } from "@/actions/student";
import { Badge, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export default async function DrivesPage() {
  const user = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: { applications: true },
  });
  if (!student) return <p>No student profile found.</p>;

  const drives = await prisma.drive.findMany({
    where: { driveStatus: "PUBLISHED" },
    include: { company: true, eligibilityRule: true, branches: true, rounds: true, _count: { select: { applications: true } } },
    orderBy: { applicationDeadline: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Open drives" subtitle="Eligibility is checked automatically against your profile — you can only apply where you qualify." />

      <div className="grid gap-4">
        {drives.map((drive) => {
          const rules = {
            minimumCgpa: drive.eligibilityRule?.minimumCgpa ?? 0,
            maximumBacklogs: drive.eligibilityRule?.maximumBacklogs ?? 0,
            branches: drive.branches.map((b) => b.branchName),
          };
          const { eligible, reasons } = checkEligibility(student, rules);
          const applied = student.applications.some((a) => a.driveId === drive.id);
          const deadlinePassed = new Date(drive.applicationDeadline) < new Date();
          const canApply = eligible && !applied && !deadlinePassed;

          return (
            <article key={drive.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{drive.company.companyName}</h2>
                    <Badge tone="slate">{drive.company.industry}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{drive.jobRole} · ₹{Number(drive.package)} LPA</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Apply by {new Date(drive.applicationDeadline).toLocaleDateString()} · {drive._count.applications} applicant(s) · {drive.rounds.length} round(s) planned
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {applied ? (
                    <Badge tone="green">Applied ✓</Badge>
                  ) : eligible ? (
                    <Badge tone="green">You are eligible</Badge>
                  ) : (
                    <div className="text-right">
                      <Badge tone="red">Not eligible</Badge>
                      <ul className="mt-1 space-y-0.5 text-right text-xs text-rose-600">
                        {reasons.map((r) => <li key={r}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <span className="text-xs font-medium text-slate-500">Eligibility:</span>
                {rules.branches.map((b) => <Badge key={b} tone="blue">{b}</Badge>)}
                <Badge tone="violet">CGPA ≥ {rules.minimumCgpa.toFixed(1)}</Badge>
                <Badge tone="amber">≤ {rules.maximumBacklogs} backlog(s)</Badge>
                <div className="ml-auto flex items-center gap-3">
                  <Link href={`/student/drives/${drive.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">Details</Link>
                  {canApply && (
                    <form action={applyToDrive}>
                      <input type="hidden" name="driveId" value={drive.id} />
                      <SubmitButton>Apply</SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {drives.length === 0 && <p className="text-sm text-slate-500">No open drives right now.</p>}
      </div>
    </div>
  );
}
