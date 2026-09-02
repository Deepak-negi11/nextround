import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Badge, Card, PageHeader } from "@/components/ui";

export default async function ReportsPage() {
  await requireRole("ADMIN");

  const [students, offers, applications] = await Promise.all([
    prisma.student.findMany({
      include: {
        user: true,
        applications: { include: { drive: { include: { company: true } }, offers: true } },
      },
      orderBy: { rollNo: "asc" },
    }),
    prisma.offer.findMany({ select: { package: true, offerStatus: true } }),
    prisma.application.count(),
  ]);

  const placed = students.filter((s) =>
    s.applications.some((a) => a.offers.some((o) => o.offerStatus === "ACCEPTED"))
  );
  const placedWithPkg = students.map((s) => {
    const offer = s.applications.flatMap((a) => a.offers).find((o) => o.offerStatus === "ACCEPTED");
    return { s, offer };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Placement report"
        subtitle={`${placed.length} of ${students.length} students placed (${applications} total applications).`}
      />

      <div className="grid gap-6">
        <Card title="Student-wise placement status">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2">Roll no</th><th className="pb-2">Name</th><th className="pb-2">Branch</th><th className="pb-2">CGPA</th><th className="pb-2">Placed at</th><th className="pb-2">CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {placedWithPkg.map(({ s, offer }) => {
                  const acceptedDrive = offer && s.applications.find((a) => a.offers.some((o) => o.id === offer.id));
                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 font-mono text-slate-500">{s.rollNo}</td>
                      <td className="py-2.5 font-medium">{s.user.name}</td>
                      <td className="py-2.5">{s.branch}</td>
                      <td className="py-2.5">{s.cgpa.toFixed(2)}</td>
                      <td className="py-2.5">
                        {acceptedDrive ? (
                          <span>{acceptedDrive.drive.company.companyName} <span className="text-xs text-slate-400">({acceptedDrive.drive.jobRole})</span></span>
                        ) : (
                          <Badge tone="slate">In process</Badge>
                        )}
                      </td>
                      <td className="py-2.5">{offer ? <span className="font-semibold text-emerald-600">₹{Number(offer.package)} LPA</span> : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Summary">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div><p className="text-xs uppercase text-slate-400">Students</p><p className="text-xl font-semibold">{students.length}</p></div>
            <div><p className="text-xs uppercase text-slate-400">Placed</p><p className="text-xl font-semibold text-emerald-600">{placed.length}</p></div>
            <div><p className="text-xs uppercase text-slate-400">Offers issued</p><p className="text-xl font-semibold">{offers.length}</p></div>
            <div>
              <p className="text-xs uppercase text-slate-400">Highest CTC</p>
              <p className="text-xl font-semibold">
                {offers.length ? `₹${Math.max(...offers.map((o) => Number(o.package)))} LPA` : "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
