"use client";

import { useActionState } from "react";
import { createInterviewer, type ActionState } from "@/actions/users";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export default function InterviewerForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createInterviewer, {});
  return (
    <form action={formAction} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Add interviewer / recruiter</h2>
      <div className="mt-4 grid gap-4">
        <div>
          <label className={labelCls} htmlFor="i-name">Full name *</label>
          <input id="i-name" name="name" required maxLength={100} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="i-email">Email *</label>
          <input id="i-email" name="email" type="email" required className={inputCls} placeholder="recruiter@company.com" />
        </div>
        <div>
          <label className={labelCls} htmlFor="i-password">Temporary password *</label>
          <input id="i-password" name="password" type="text" required minLength={MIN_PASSWORD_LENGTH} autoComplete="off" className={inputCls} />
        </div>
      </div>
      {state.error && <p role="alert" className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.error}</p>}
      {state.ok && <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.ok}</p>}
      <SubmitButton className="mt-4" pendingLabel="Adding…">Add interviewer</SubmitButton>
    </form>
  );
}
