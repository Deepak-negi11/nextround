"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];

export default function ProfileForm({
  initial,
  action,
}: {
  initial: { name: string; rollNo: string; branch: string; cgpa: number; activeBacklogs: number; graduationYear: number; resumeLink: string };
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Full name</label>
          <input disabled value={initial.name} className={`${inputCls} bg-slate-50 text-slate-500`} />
        </div>
        <div>
          <label className={labelCls}>Roll no</label>
          <input disabled value={initial.rollNo} className={`${inputCls} bg-slate-50 text-slate-500`} />
        </div>
        <div>
          <label className={labelCls} htmlFor="branch">Branch</label>
          <select id="branch" name="branch" defaultValue={initial.branch} className={inputCls}>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="cgpa">CGPA (0–10)</label>
          <input id="cgpa" name="cgpa" type="number" step="0.01" min="0" max="10" defaultValue={initial.cgpa} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="activeBacklogs">Active backlogs</label>
          <input id="activeBacklogs" name="activeBacklogs" type="number" min="0" defaultValue={initial.activeBacklogs} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="graduationYear">Graduation year</label>
          <input id="graduationYear" name="graduationYear" type="number" defaultValue={initial.graduationYear} required className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="resumeLink">Résumé link (optional)</label>
          <input id="resumeLink" name="resumeLink" type="url" placeholder="https://drive.google.com/…" defaultValue={initial.resumeLink} className={inputCls} />
        </div>
      </div>
      {state.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.ok}</p>}
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
