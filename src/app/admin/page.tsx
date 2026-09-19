import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Badge, Card, PageHeader, StatCard, STATUS_TONE, pretty } from "@/components/ui";

export default async function AdminDashboard() {
  await requireRole("ADMIN");

  const [students, drives, companies, applications, offers] = await Promise.all([
    prisma.student.count(),
    prisma.drive.findMany({ include: { company: true, _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.company.count(),
    prisma.application.findMany({ select: { applicationStatus: true } }),
    prisma.offer.findMany({ include: { application: { include: { drive: { include: { company: true } }, student: { include: { user: true } } } } } }),
  ]);

  const placed = offers.filter((o) => o.offerStatus === "ACCEPTED");
  const avgPackage = offers.length
    ? offers.reduce((sum, o) => sum + Number(o.package), 0) / offers.length
    : 0;
  const highest = offers.reduce((m, o) => Math.max(m, Number(o.package)), 0);
  const selected = applications.filter((a) => ["SELECTED", "OFFERED", "OFFER_ACCEPTED", "OFFER_DECLINED"].includes(a.applicationStatus)).length;
  const selectionRate = applications.length ? Math.round((selected / applications.length) * 100) : 0;

  const byBranch: Record<string, { total: number; placed: number }> = {};
  const allStudents = await prisma.student.findMany({
    include: { applications: { include: { offers: true } } },
  });
  for (const s of allStudents) {
    byBranch[s.branch] ??= { total: 0, placed: 0 };
    byBranch[s.branch].total += 1;
    if (s.applications.some((a) => a.offers.some((o) => o.offerStatus === "ACCEPTED"))) {
      byBranch[s.branch].placed += 1;
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Placement analytics"
        subtitle="Live dashboard — updates as drives progress and offers are issued."
        actions={
          <div className="flex gap-3">
            <Link href="/admin/drives" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600">+ New drive</Link>
            <Link href="/admin/companies" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-50">Companies</Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Registered students" value={students} />
        <StatCard label="Active companies" value={companies} />
        <StatCard label="Applications" value={applications.length} hint={`${selectionRate}% reached selection`} />
        <StatCard label="Offers accepted" value={placed.length} hint={offers.length ? `Avg ₹${avgPackage.toFixed(1)} LPA · Highest ₹${highest} LPA` : "No offers yet"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Branch-wise placement">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2">Branch</th><th className="pb-2">Students</th><th className="pb-2">Placed</th><th className="pb-2">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(byBranch).map(([branch, v]) => (
                <tr key={branch}>
                  <td className="py-2.5 font-medium">{branch}</td>
                  <td className="py-2.5">{v.total}</td>
                  <td className="py-2.5">{v.placed}</td>
                  <td className="py-2.5">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-slate-900" style={{ width: `${(v.placed / v.total) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Recent offers">
          {offers.length === 0 ? (
            <p className="text-sm text-slate-500">No offers issued yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {offers.slice(-6).reverse().map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{o.application.student.user.name} → {o.application.drive.company.companyName}</p>
                    <p className="text-xs text-slate-400">₹{Number(o.package)} LPA · {new Date(o.issuedAt).toLocaleDateString()}</p>
                  </div>
                  <Badge tone={STATUS_TONE[o.offerStatus]}>{pretty(o.offerStatus)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="All drives">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2">Company</th><th className="pb-2">Role</th><th className="pb-2">Package</th><th className="pb-2">Applicants</th><th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drives.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="py-2.5 font-medium">
                  <Link href={`/admin/drives/${d.id}`} className="text-brand-600 hover:text-brand-700 hover:underline">{d.company.companyName}</Link>
                </td>
                <td className="py-2.5">{d.jobRole}</td>
                <td className="py-2.5">₹{Number(d.package)} LPA</td>
                <td className="py-2.5">{d._count.applications}</td>
                <td className="py-2.5"><Badge tone={STATUS_TONE[d.driveStatus]}>{pretty(d.driveStatus)}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
