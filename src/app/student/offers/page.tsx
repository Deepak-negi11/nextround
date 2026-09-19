import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { respondToOffer } from "@/actions/student";
import { Badge, PageHeader, STATUS_TONE, pretty } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";

export default async function OffersPage() {
  const user = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      applications: {
        where: { offers: { some: {} } },
        include: { drive: { include: { company: true } }, offers: true },
      },
    },
  });
  if (!student) return <p>No student profile found.</p>;

  const offers = student.applications.flatMap((a) => a.offers.map((o) => ({ offer: o, app: a })));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Offers" subtitle="Offers you've received — accept or decline while they're open." />
      {offers.length === 0 && <p className="text-sm text-slate-500">No offers yet. Keep going — your rounds are tracked under My Applications.</p>}

      {offers.map(({ offer, app }) => (
        <article key={offer.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{app.drive.company.companyName}</h2>
              <p className="text-sm text-slate-600">{app.drive.jobRole}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">₹{Number(offer.package)} LPA</p>
              <Badge tone={STATUS_TONE[offer.offerStatus]}>{pretty(offer.offerStatus)}</Badge>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Issued {new Date(offer.issuedAt).toLocaleDateString()}</p>

          {offer.offerStatus === "ISSUED" && (
            <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
              <form action={respondToOffer}>
                <input type="hidden" name="offerId" value={offer.id} />
                <input type="hidden" name="accept" value="1" />
                <SubmitButton className="bg-slate-900 hover:bg-slate-700">Accept offer</SubmitButton>
              </form>
              <form action={respondToOffer}>
                <input type="hidden" name="offerId" value={offer.id} />
                <input type="hidden" name="accept" value="0" />
                <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Decline</button>
              </form>
            </div>
          )}
          {offer.offerStatus !== "ISSUED" && offer.respondedAt && (
            <p className="mt-3 text-xs text-slate-400">You {offer.offerStatus.toLowerCase()} this offer on {new Date(offer.respondedAt).toLocaleDateString()}.</p>
          )}
        </article>
      ))}
    </div>
  );
}
