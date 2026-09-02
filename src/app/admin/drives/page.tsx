import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { createDrive } from "@/actions/admin";
import { Badge, PageHeader, STATUS_TONE, pretty } from "@/components/ui";
import DriveForm from "./DriveForm";

export default async function DrivesPage() {
  await requireRole("ADMIN");
  const [companies, drives] = await Promise.all([
    prisma.company.findMany({ orderBy: { companyName: "asc" } }),
    prisma.drive.findMany({
      include: {
        company: true,
        eligibilityRule: true,
        branches: true,
        rounds: { orderBy: { roundNumber: "asc" } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Drives" subtitle="Create drives, track applicants and manage selection rounds." />
      <DriveForm companies={companies.map((c) => ({ id: c.id, name: c.companyName }))} action={createDrive} />

      <section className="space-y-3">
        {drives.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            No placement drives created yet. Click <span className="font-medium text-slate-700">&ldquo;+ Create company drive&rdquo;</span> above to post your first drive.
          </div>
        ) : (
          drives.map((d) => (
            <Link key={d.id} href={`/admin/drives/${d.id}`} className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{d.company.companyName} — {d.jobRole}</h2>
                    <Badge tone={STATUS_TONE[d.driveStatus]}>{pretty(d.driveStatus)}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    ₹{Number(d.package)} LPA · deadline {new Date(d.applicationDeadline).toLocaleDateString()} · {d._count.applications} applicant(s) · {d.rounds.length} round(s)
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.branches.map((b) => <Badge key={b.branchName} tone="blue">{b.branchName}</Badge>)}
                  {d.eligibilityRule && <Badge tone="violet">CGPA ≥ {d.eligibilityRule.minimumCgpa}</Badge>}
                  {d.eligibilityRule && <Badge tone="amber">≤ {d.eligibilityRule.maximumBacklogs} backlog</Badge>}
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
