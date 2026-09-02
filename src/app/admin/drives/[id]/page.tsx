import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { setDriveStatus } from "@/actions/admin";
import { Badge, Card, PageHeader, STATUS_TONE, pretty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import EligibilityForm from "./EligibilityForm";
import RoundForm from "./RoundForm";
import OfferButton from "./OfferButton";

export default async function DriveManage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("ADMIN");
  const drive = await prisma.drive.findUnique({
    where: { id: parseInt(id) },
    include: {
      company: true,
      eligibilityRule: true,
      branches: true,
      rounds: { orderBy: { roundNumber: "asc" }, include: { _count: { select: { slots: true, results: true } } } },
      applications: {
        include: {
          student: { include: { user: true } },
          results: { include: { round: true } },
          offers: true,
        },
        orderBy: { appliedAt: "asc" },
      },
    },
  });
  if (!drive) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/admin/drives" className="text-sm text-brand-600 hover:text-brand-700 hover:underline">← All drives</Link>

      <PageHeader
        title={drive.company.companyName}
        subtitle={`${drive.jobRole} · ₹${Number(drive.package)} LPA · Deadline ${new Date(drive.applicationDeadline).toLocaleDateString()} · ${drive.applications.length} application(s)`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[drive.driveStatus]}>{pretty(drive.driveStatus)}</Badge>
            {drive.driveStatus === "DRAFT" && (
              <form action={setDriveStatus}>
                <input type="hidden" name="driveId" value={drive.id} />
                <input type="hidden" name="status" value="PUBLISHED" />
                <SubmitButton>🚀 Publish drive</SubmitButton>
              </form>
            )}
            {drive.driveStatus === "PUBLISHED" && (
              <form action={setDriveStatus}>
                <input type="hidden" name="driveId" value={drive.id} />
                <input type="hidden" name="status" value="CLOSED" />
                <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-50">Close applications</button>
              </form>
            )}
          </div>
        }
      />

      {drive.description && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm leading-6 text-slate-600">{drive.description}</p>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Eligibility rules">
          <EligibilityForm
            driveId={drive.id}
            initial={{
              minimumCgpa: drive.eligibilityRule?.minimumCgpa ?? 7,
              maximumBacklogs: drive.eligibilityRule?.maximumBacklogs ?? 0,
              branches: drive.branches.map((b) => b.branchName),
            }}
          />
        </Card>

        <Card title="Selection rounds">
          <ol className="space-y-2">
            {drive.rounds.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <div>
                  <Link href={`/admin/rounds/${r.id}`} className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
                    R{r.roundNumber}: {r.roundType}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {pretty(r.mode)} · {r._count.slots} slot(s) · {r._count.results} result(s)
                  </p>
                </div>
                <Badge tone={STATUS_TONE[r.roundStatus] ?? "slate"}>{pretty(r.roundStatus)}</Badge>
              </li>
            ))}
            {drive.rounds.length === 0 && <p className="text-sm text-slate-500">No rounds yet — add the first round (aptitude, coding, GD, interview or custom).</p>}
          </ol>
          <RoundForm driveId={drive.id} />
        </Card>
      </div>

      <Card title={`Applications (${drive.applications.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2">Student</th><th className="pb-2">Branch</th><th className="pb-2">CGPA</th><th className="pb-2">Backlogs</th>
                <th className="pb-2">Round results</th><th className="pb-2">Status</th><th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drive.applications.map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5">
                    <p className="font-medium">{a.student.user.name}</p>
                    <p className="font-mono text-xs text-slate-400">{a.student.rollNo}</p>
                  </td>
                  <td className="py-2.5">{a.student.branch}</td>
                  <td className="py-2.5">{a.student.cgpa.toFixed(2)}</td>
                  <td className="py-2.5">{a.student.activeBacklogs}</td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {a.results.length === 0 && <span className="text-xs text-slate-400">—</span>}
                      {a.results.map((r) => (
                        <span key={r.id} className="text-xs text-slate-500">
                          R{r.round.roundNumber}: <Badge tone={STATUS_TONE[r.outcome]}>{pretty(r.outcome)}</Badge>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5"><Badge tone={STATUS_TONE[a.applicationStatus]}>{pretty(a.applicationStatus)}</Badge></td>
                  <td className="py-2.5 text-right">
                    <OfferButton applicationId={a.id} status={a.applicationStatus} hasOffer={a.offers.length > 0} />
                  </td>
                </tr>
              ))}
              {drive.applications.length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center text-sm text-slate-500">No applications yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
