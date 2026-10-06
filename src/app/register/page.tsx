"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type LoginState } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Logo } from "@/components/Logo";
import { inputCls, labelCls } from "@/components/ui";
import { BRANCHES } from "@/lib/constants";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

export default function RegisterPage() {
  const [state, formAction] = useActionState<LoginState, FormData>(register, {});

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl md:p-10">
        <Logo />
        <h1 className="mt-6 font-display text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-slate-900">Create your student account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use your college email. Your academics decide which drives you can apply to, so enter them accurately.
        </p>

        <form action={formAction} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="name">Full name</label>
              <input id="name" name="name" required maxLength={100} autoComplete="name" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="email">College email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@college.edu" />
            </div>
            <div>
              <label className={labelCls} htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="rollNo">Roll no</label>
              <input id="rollNo" name="rollNo" required maxLength={40} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="branch">Branch</label>
              <select id="branch" name="branch" required defaultValue="" className={inputCls}>
                <option value="" disabled>Select…</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="cgpa">CGPA (0–10)</label>
              <input id="cgpa" name="cgpa" type="number" step="0.01" min="0" max="10" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="activeBacklogs">Active backlogs</label>
              <input id="activeBacklogs" name="activeBacklogs" type="number" min="0" defaultValue={0} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="graduationYear">Graduation year</label>
              <input id="graduationYear" name="graduationYear" type="number" min="2000" max="2100" required className={inputCls} />
            </div>
          </div>

          {state.error && (
            <p role="alert" className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-900/15">
              {state.error}
            </p>
          )}
          <SubmitButton className="w-full py-2.5" pendingLabel="Creating account…">Create account</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
