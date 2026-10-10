"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, type LoginState } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Logo } from "@/components/Logo";
import { inputCls, labelCls } from "@/components/ui";

const DEMO = [
  { role: "Placement Admin", email: "admin@college.edu", password: "admin123" },
  { role: "Interviewer", email: "interviewer@college.edu", password: "int123" },
  { role: "Student", email: "student@college.edu", password: "student123" },
];

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);
  const describedBy = state.error ? "login-error" : undefined;

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12">
      <Logo />

      <div className="mt-8 w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] sm:p-9">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">Sign in</h1>
        <p className="mt-1.5 text-sm text-slate-500">Use your college account to continue.</p>

        <form action={formAction} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={state.email}
              aria-invalid={state.error ? true : undefined}
              aria-describedby={describedBy}
              className={`${inputCls} h-10`}
              placeholder="you@college.edu"
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                aria-invalid={state.error ? true : undefined}
                aria-describedby={describedBy}
                className={`${inputCls} h-10 pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-1 right-1 rounded-md px-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {state.error && (
            <p
              id="login-error"
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {state.error}
            </p>
          )}

          <SubmitButton className="h-10 w-full" pendingLabel="Signing in…">Sign in</SubmitButton>
        </form>

        <div className="my-7 flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or try a demo account</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <ul className="space-y-2" aria-label="Demo accounts">
          {DEMO.map((d) => (
            <li key={d.email}>
              <form action={formAction}>
                <input type="hidden" name="email" value={d.email} />
                <input type="hidden" name="password" value={d.password} />
                <button
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:translate-y-px"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800">{d.role}</span>
                    <span className="block truncate font-mono text-xs text-slate-400">{d.email} · {d.password}</span>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                    aria-hidden
                  >
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        New student?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
