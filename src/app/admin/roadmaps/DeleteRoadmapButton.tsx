"use client";

import { deleteRoadmap } from "@/actions/roadmaps";

export default function DeleteRoadmapButton({ id, label }: { id: number; label: string }) {
  return (
    <form
      action={deleteRoadmap}
      onSubmit={(e) => {
        if (!confirm(`Delete the roadmap "${label}"?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="roadmapId" value={id} />
      <button className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
        Delete
      </button>
    </form>
  );
}
