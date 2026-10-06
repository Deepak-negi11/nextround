import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Badge, PageHeader } from "@/components/ui";
import RoadmapForm from "./RoadmapForm";
import DeleteRoadmapButton from "./DeleteRoadmapButton";

export default async function AdminRoadmapsPage() {
  await requireRole("ADMIN");
  const roadmaps = await prisma.roadmap.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Senior roadmaps" subtitle="Publish how placed seniors prepared. Students see these under Senior Roadmaps." />

      <RoadmapForm />

      <div className="grid gap-4">
        {roadmaps.length === 0 && <p className="text-sm text-slate-500">No roadmaps yet. Add the first one above.</p>}
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
                <DeleteRoadmapButton id={rm.id} label={`${rm.company} · ${rm.role}`} />
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-slate-600">{rm.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
