"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { register, type LoginState } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Logo } from "@/components/Logo";
import { inputCls, labelCls } from "@/components/ui";

const hintCls = "text-xs text-slate-500";

export default function RegisterForm({
  domains,
  branches,
  minPassword,
}: {
  domains: string[];
  branches: readonly string[];
  minPassword: number;
}) {
  const [state, formAction] = useActionState<LoginState, FormData>(register, {});
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const v = state.values ?? {};
  const mismatch = confirm.length > 0 && confirm !== password;
  const domainList = domains.map((d) => `@${d}`).join(" or ");

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12">
      <Logo />

      <div className="mt-8 w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] sm:p-9">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">Create your student account</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Your academics decide which drives you can apply to, so enter them exactly as on your marksheet.
        </p>

        <form action={formAction} className="mt-7 space-y-7">
          <section className="space-y-4" aria-labelledby="account-heading">
            <h2 id="account-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account</h2>
            <div className="space-y-1.5">
              <label className={labelCls} htmlFor="name">Full name</label>
              <input id="name" name="name" defaultValue={v.name} required maxLength={100} autoComplete="name" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls} htmlFor="email">College email</label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={v.email}
                required
                autoComplete="email"
                aria-describedby="email-hint"
                className={inputCls}
                placeholder={`you@${domains[0] ?? "college.edu"}`}
              />
              <p id="email-hint" className={hintCls}>Must end in {domainList}.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={minPassword}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby="password-hint"
                    className={`${inputCls} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-1 right-1 rounded-md px-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p id="password-hint" className={hintCls}>At least {minPassword} characters.</p>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={minPassword}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-invalid={mismatch || undefined}
                  aria-describedby="confirm-hint"
                  className={`${inputCls} ${mismatch ? "border-red-300 focus-visible:ring-red-400" : ""}`}
                />
                <p id="confirm-hint" aria-live="polite" className={mismatch ? "text-xs text-red-600" : hintCls}>
                  {mismatch ? "Passwords don't match yet." : confirm && confirm === password ? "Passwords match." : " "}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-6" aria-labelledby="ids-heading">
            <div>
              <h2 id="ids-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-400">University IDs</h2>
              <p className="mt-1 text-xs text-slate-500">
                Copy these from your university ID card. They can&apos;t be changed later — only the placement cell can correct them.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="rollNo">University roll no</label>
                <input id="rollNo" name="rollNo" defaultValue={v.rollNo} required maxLength={40} autoCapitalize="characters" spellCheck={false} placeholder="As on your ID card" className={`${inputCls} font-mono uppercase placeholder:normal-case`} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="enrollmentNo">Enrollment no</label>
                <input id="enrollmentNo" name="enrollmentNo" defaultValue={v.enrollmentNo} required maxLength={40} autoCapitalize="characters" spellCheck={false} placeholder="As on your ID card" className={`${inputCls} font-mono uppercase placeholder:normal-case`} />
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-6" aria-labelledby="academics-heading">
            <h2 id="academics-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Academic record</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="branch">Branch</label>
                <select key={v.branch ?? ""} id="branch" name="branch" required defaultValue={v.branch ?? ""} className={inputCls}>
                  <option value="" disabled>Select branch</option>
                  {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="graduationYear">Graduation year</label>
                <input id="graduationYear" name="graduationYear" defaultValue={v.graduationYear} type="number" inputMode="numeric" min="2000" max="2100" required className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="cgpa">CGPA</label>
                <input id="cgpa" name="cgpa" defaultValue={v.cgpa} type="number" inputMode="decimal" step="0.01" min="0" max="10" required placeholder="0–10" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls} htmlFor="activeBacklogs">Active backlogs</label>
                <input id="activeBacklogs" name="activeBacklogs" type="number" inputMode="numeric" min="0" defaultValue={v.activeBacklogs ?? 0} required className={inputCls} />
              </div>
            </div>
          </section>

          {state.error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          <SubmitButton className="h-10 w-full" pendingLabel="Creating account…">Create account</SubmitButton>
        </form>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
