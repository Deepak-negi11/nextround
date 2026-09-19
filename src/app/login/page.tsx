"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Logo } from "@/components/Logo";
import { inputCls, labelCls, overlineCls } from "@/components/ui";

const DEMO = [
  { role: "Placement Admin", email: "admin@college.edu", password: "admin123" },
  { role: "Interviewer", email: "interviewer@college.edu", password: "int123" },
  { role: "Student", email: "student@college.edu", password: "student123" },
];

const FEATURES = [
  "Eligibility-checked company drives",
  "Flexible rounds — aptitude, coding, GD, interviews",
  "Online & offline round logistics",
  "Interviewer outcomes & offers",
  "Live placement analytics",
  "Senior roadmaps: how offers actually happen",
];

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-10 text-white md:flex md:[clip-path:polygon(0_0,100%_0,calc(100%_-_3.5rem)_100%,0_100%)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div aria-hidden className="pointer-events-none absolute -right-10 top-0 h-[120%] w-24 rotate-12 bg-white/5" />

          <div className="relative">
            <Logo markClassName="bg-white" wordmarkClassName="text-white" />
            <p className="mt-0.5 text-sm text-brand-100">Campus Placement Portal</p>
          </div>

          <div className="relative">
            <p className="font-display text-3xl leading-tight tracking-tight md:text-4xl">Your next offer starts here.</p>
            <ul className="mt-6 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/95">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15" aria-hidden>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/70">Students · Placement Admin · Interviewers</p>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-6 md:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use a demo account below or your own credentials.</p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className={labelCls} htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={state.error ? true : undefined}
                aria-describedby={state.error ? "login-error" : undefined}
                className={inputCls}
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                aria-invalid={state.error ? true : undefined}
                aria-describedby={state.error ? "login-error" : undefined}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            {state.error && (
              <p id="login-error" role="alert" className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-900/15">
                {state.error}
              </p>
            )}
            <SubmitButton className="w-full py-2.5">Sign in</SubmitButton>
          </form>

          <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
            <p className={`${overlineCls} text-slate-400`}>Demo accounts</p>
            {DEMO.map((d) => (
              <form
                key={d.email}
                action={formAction}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition hover:border-brand-300 hover:bg-brand-50/50"
              >
                <div>
                  <p className="font-medium text-slate-700">{d.role}</p>
                  <p className="font-mono text-xs text-slate-400">{d.email} / {d.password}</p>
                </div>
                <input type="hidden" name="email" value={d.email} />
                <input type="hidden" name="password" value={d.password} />
                <button className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 transition hover:text-brand-700 hover:underline">
                  Use
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                  </svg>
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
