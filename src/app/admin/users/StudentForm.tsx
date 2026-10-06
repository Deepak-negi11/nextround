"use client";

import { useActionState } from "react";
import { createStudent, type ActionState } from "@/actions/users";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";
import { BRANCHES } from "@/lib/constants";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export default function StudentForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createStudent, {});
  return (
    <form action={formAction} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Add student</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="s-name">Full name *</label>
          <input id="s-name" name="name" required maxLength={100} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="s-email">Email *</label>
          <input id="s-email" name="email" type="email" required className={inputCls} placeholder="name@college.edu" />
        </div>
        <div>
          <label className={labelCls} htmlFor="s-password">Temporary password *</label>
          <input id="s-password" name="password" type="text" required minLength={MIN_PASSWORD_LENGTH} autoComplete="off" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="s-rollNo">Roll no *</label>
          <input id="s-rollNo" name="rollNo" required maxLength={40} className={inputCls} placeholder="2K23/CSE/101" />
        </div>
        <div>
          <label className={labelCls} htmlFor="s-branch">Branch *</label>
          <select id="s-branch" name="branch" required className={inputCls} defaultValue="CSE">
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="s-cgpa">CGPA (0–10) *</label>
          <input id="s-cgpa" name="cgpa" type="number" step="0.01" min="0" max="10" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="s-backlogs">Active backlogs *</label>
          <input id="s-backlogs" name="activeBacklogs" type="number" min="0" defaultValue={0} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="s-year">Graduation year *</label>
          <input id="s-year" name="graduationYear" type="number" min="2000" max="2100" required className={inputCls} />
        </div>
      </div>
      {state.error && <p role="alert" className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.error}</p>}
      {state.ok && <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.ok}</p>}
      <SubmitButton className="mt-4" pendingLabel="Adding…">Add student</SubmitButton>
    </form>
  );
}
