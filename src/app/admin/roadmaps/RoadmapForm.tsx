"use client";

import { useActionState } from "react";
import { createRoadmap, type ActionState } from "@/actions/roadmaps";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";
import { ROADMAP_CATEGORIES } from "@/lib/constants";

export default function RoadmapForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createRoadmap, {});
  return (
    <form action={formAction} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Add senior roadmap</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="r-author">Senior (name, batch) *</label>
          <input id="r-author" name="author" required maxLength={100} className={inputCls} placeholder="Riya Sharma, CSE 2025" />
        </div>
        <div>
          <label className={labelCls} htmlFor="r-company">Company *</label>
          <input id="r-company" name="company" required maxLength={100} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="r-role">Role *</label>
          <input id="r-role" name="role" required maxLength={100} className={inputCls} placeholder="SDE Intern" />
        </div>
        <div>
          <label className={labelCls} htmlFor="r-package">Package (LPA) *</label>
          <input id="r-package" name="packageLpa" type="number" step="0.1" min="0" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="r-category">Route *</label>
          <select id="r-category" name="category" required defaultValue="" className={inputCls}>
            <option value="" disabled>Select…</option>
            {ROADMAP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelCls} htmlFor="r-summary">What worked *</label>
          <textarea id="r-summary" name="summary" required rows={3} maxLength={2000} className={inputCls} placeholder="Prep strategy, resources, interview experience…" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelCls} htmlFor="r-timeline">Timeline *</label>
          <input id="r-timeline" name="timeline" required maxLength={1000} className={inputCls} placeholder="2nd yr: DSA → 3rd yr: internship → final round → offer" />
        </div>
      </div>
      {state.error && <p role="alert" className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.error}</p>}
      {state.ok && <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.ok}</p>}
      <SubmitButton className="mt-4" pendingLabel="Adding…">Add roadmap</SubmitButton>
    </form>
  );
}
