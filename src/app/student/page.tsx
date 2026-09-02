import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Badge, Card, PageHeader, StatCard, STATUS_TONE, pretty } from "@/components/ui";

export default async function StudentDashboard() {
  const user = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      applications: {
        include: {
          drive: { include: { company: true, rounds: { orderBy: { roundNumber: "asc" } } } },
          offers: true,
        },
      },
    },
  });
  if (!student) return <p>No student profile found.</p>;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const active = student.applications.filter(
    (a) => !["REJECTED", "OFFER_ACCEPTED", "OFFER_DECLINED"].includes(a.applicationStatus)
  );
  const offers = student.applications.flatMap((a) => a.offers);

  const upcoming = active.flatMap((a) =>
    a.drive.rounds
      .filter((r) => r.roundStatus === "ANNOUNCED")
      .map((r) => ({ company: a.drive.company.companyName, role: a.drive.jobRole, round: r }))
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={`Hi ${user.name.split(" ")[0]} 👋`}
        subtitle={`${student.branch} · CGPA ${student.cgpa.toFixed(2)} · ${student.activeBacklogs} active backlog(s) · Class of ${student.graduationYear}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active applications" value={active.length} />
        <StatCard label="Offers" value={offers.length} hint={offers.some((o) => o.offerStatus === "ISSUED") ? "Action needed — respond to your offer" : undefined} />
        <StatCard label="Total applied" value={student.applications.length} />
      </div>

      <Card title="Latest updates">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing yet — drive openings, round announcements and results will land here.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <li key={n.id} className="py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-sm text-slate-500">{n.body}</p>
                {n.href && (
                  <Link href={n.href} className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline">View →</Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Upcoming rounds">
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing scheduled right now. Keep an eye on <Link className="text-brand-600 hover:text-brand-700 hover:underline" href="/student/drives">open drives</Link>.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map(({ company, role, round }) => (
              <li key={round.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium">{company} — {role}</p>
                  <p className="text-xs text-slate-500">
                    Round {round.roundNumber}: {round.roundType} · {pretty(round.mode)}
                    {round.mode === "ONLINE" && round.startAt && ` · ${new Date(round.startAt).toLocaleString()}`}
                    {round.mode === "OFFLINE" && round.reportingTime && ` · Report by ${round.reportingTime}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {round.mode === "OFFLINE" && round.venue && <Badge tone="amber">{round.venue} {round.roomNumber}</Badge>}
                  <Link href="/student/applications" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">View details</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="My applications">
        {student.applications.length === 0 ? (
          <p className="text-sm text-slate-500">You haven&apos;t applied to any drive yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2">Company</th><th className="pb-2">Role</th><th className="pb-2">Package</th><th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {student.applications.map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5 font-medium">{a.drive.company.companyName}</td>
                  <td className="py-2.5">{a.drive.jobRole}</td>
                  <td className="py-2.5">₹{Number(a.drive.package)} LPA</td>
                  <td className="py-2.5"><Badge tone={STATUS_TONE[a.applicationStatus]}>{pretty(a.applicationStatus)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
