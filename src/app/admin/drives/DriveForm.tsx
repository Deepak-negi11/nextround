"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

export default function DriveForm({
  companies,
  action,
}: {
  companies: { id: number; name: string }[];
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return (
    <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <summary className="cursor-pointer px-5 py-3 text-sm font-semibold">+ Create company drive</summary>
      <form action={formAction} className="space-y-4 border-t border-slate-100 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="companyId">Company *</label>
            {companies.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-xs text-slate-700">
                No companies added yet. <Link href="/admin/companies" className="font-semibold underline">Add a company</Link> first.
              </div>
            ) : (
              <select id="companyId" name="companyId" required className={inputCls}>
                <option value="">Select a company...</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="jobRole">Job role *</label>
            <input id="jobRole" name="jobRole" required className={inputCls} placeholder='e.g. "Software Engineer Intern"' />
          </div>
          <div>
            <label className={labelCls} htmlFor="package">Package (LPA) *</label>
            <input id="package" name="package" type="number" step="0.1" min="0" required className={inputCls} placeholder="45" />
          </div>
          <div>
            <label className={labelCls} htmlFor="applicationDeadline">Application deadline *</label>
            <input id="applicationDeadline" name="applicationDeadline" type="date" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="minimumCgpa">Minimum CGPA *</label>
            <input id="minimumCgpa" name="minimumCgpa" type="number" step="0.1" min="0" max="10" defaultValue={7} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="maximumBacklogs">Max active backlogs *</label>
            <input id="maximumBacklogs" name="maximumBacklogs" type="number" min="0" defaultValue={0} required className={inputCls} />
          </div>
        </div>
        <div>
          <span className={labelCls}>Eligible branches *</span>
          <div className="flex flex-wrap gap-3">
            {BRANCHES.map((b) => (
              <label key={b} className="flex items-center gap-1.5 text-sm text-slate-700">
                <input type="checkbox" name="branches" value={b} defaultChecked={b === "CSE" || b === "IT"} className="rounded border-slate-300" />
                {b}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={2} className={inputCls} placeholder="Role details, internship→PPO policy, service bond…" />
        </div>
        {state.error && <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.error}</p>}
        <SubmitButton>Create drive (draft)</SubmitButton>
        <p className="text-xs text-slate-400">Drives start as drafts — add rounds, review eligibility, then publish.</p>
      </form>
    </details>
  );
}
