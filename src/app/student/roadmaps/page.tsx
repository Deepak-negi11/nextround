import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Badge, PageHeader } from "@/components/ui";

export default async function RoadmapsPage() {
  await requireRole("STUDENT");
  const roadmaps = await prisma.roadmap.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Senior roadmaps 🚀"
        subtitle="How seniors from your college actually landed Google, Amazon, Microsoft and JP Morgan — DSA route, AI/ML route, and more."
      />

      <div className="grid gap-4">
        {roadmaps.map((rm) => (
          <article key={rm.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">{rm.company} · {rm.role}</h2>
                <p className="text-xs text-slate-400">{rm.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="indigo">{rm.category}</Badge>
                <Badge tone="green">₹{rm.packageLpa} LPA</Badge>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{rm.summary}</p>
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">🗺 {rm.timeline}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
