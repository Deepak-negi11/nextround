import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { createCompany } from "@/actions/admin";
import CompanyForm from "./CompanyForm";
import { PageHeader } from "@/components/ui";

export default async function CompaniesPage() {
  await requireRole("ADMIN");
  const companies = await prisma.company.findMany({
    include: { _count: { select: { drives: true } } },
    orderBy: { companyName: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Companies" subtitle="Recruiting partners on campus and their contacts." />

      <CompanyForm action={createCompany} />

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Company</th><th className="px-5 py-3">Industry</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Drives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  No companies added yet. Use the form above to add your first recruiting partner.
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium">{c.companyName}</p>
                    {c.website && <a href={`https://${c.website}`} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:text-brand-700 hover:underline">{c.website}</a>}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.industry ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {c.contactName ? <p>{c.contactName}</p> : "—"}
                    {c.contactEmail && <p className="text-xs text-slate-400">{c.contactEmail}</p>}
                  </td>
                  <td className="px-5 py-3">{c._count.drives}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
