"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

export default function CompanyForm({ action }: { action: (prev: ActionState, fd: FormData) => Promise<ActionState> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return (
    <form action={formAction} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold">Add company</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="companyName">Company name *</label>
          <input id="companyName" name="companyName" required className={inputCls} placeholder="e.g. Amazon" />
        </div>
        <div>
          <label className={labelCls} htmlFor="industry">Industry</label>
          <input id="industry" name="industry" className={inputCls} placeholder="e.g. E-commerce & Cloud" />
        </div>
        <div>
          <label className={labelCls} htmlFor="website">Website</label>
          <input id="website" name="website" className={inputCls} placeholder="amazon.com" />
        </div>
        <div>
          <label className={labelCls} htmlFor="contactName">Contact person</label>
          <input id="contactName" name="contactName" className={inputCls} placeholder="Recruiter name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="contactEmail">Contact email</label>
          <input id="contactEmail" name="contactEmail" type="email" className={inputCls} placeholder="recruiter@company.com" />
        </div>
        <div className="flex items-end">
          <SubmitButton className="w-full sm:w-auto">Add company</SubmitButton>
        </div>
      </div>
      {state.error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
      {state.ok && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.ok}</p>}
    </form>
  );
}
