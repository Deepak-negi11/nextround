"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/student";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";
import { BRANCHES } from "@/lib/constants";

export default function ProfileForm({
  initial,
  action,
}: {
  initial: { name: string; email: string; rollNo: string; enrollmentNo: string; branch: string; cgpa: number; activeBacklogs: number; graduationYear: number; resumeLink: string };
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelCls} htmlFor="name">Full name</label>
          <input id="name" name="name" required maxLength={100} autoComplete="name" defaultValue={initial.name} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor="branch">Branch</label>
          <select id="branch" name="branch" defaultValue={initial.branch} className={inputCls}>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor="cgpa">CGPA (0–10)</label>
          <input id="cgpa" name="cgpa" type="number" step="0.01" min="0" max="10" defaultValue={initial.cgpa} required className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor="activeBacklogs">Active backlogs</label>
          <input id="activeBacklogs" name="activeBacklogs" type="number" min="0" defaultValue={initial.activeBacklogs} required className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls} htmlFor="graduationYear">Graduation year</label>
          <input id="graduationYear" name="graduationYear" type="number" min="2000" max="2100" defaultValue={initial.graduationYear} required className={inputCls} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className={labelCls} htmlFor="resumeLink">Résumé link (optional)</label>
          <input id="resumeLink" name="resumeLink" type="url" placeholder="https://drive.google.com/…" defaultValue={initial.resumeLink} className={inputCls} />
        </div>
      </div>

      {/* Identity fields are fixed at registration — shown as plain text, not as inputs that look editable. */}
      <dl className="grid gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-500">University roll no</dt>
          <dd className="mt-0.5 font-mono text-slate-800">{initial.rollNo}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Enrollment no</dt>
          <dd className="mt-0.5 font-mono text-slate-800">
            {initial.enrollmentNo || <span className="font-sans text-amber-700">Not added yet</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">College email</dt>
          <dd className="mt-0.5 truncate text-slate-800">{initial.email}</dd>
        </div>
        <p className="text-xs text-slate-500 sm:col-span-3">
          These identify you in placement records, so they&apos;re locked. Ask the placement cell to add or correct them.
        </p>
      </dl>

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.ok && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.ok}</p>
      )}
      <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
    </form>
  );
}
