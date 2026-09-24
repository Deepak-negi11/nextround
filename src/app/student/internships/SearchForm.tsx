"use client";

import { useActionState } from "react";
import type { InternshipSearchState } from "@/actions/internships";
import { SUGGESTED_ROLES } from "@/actions/internships";
import { SubmitButton } from "@/components/SubmitButton";
import { inputCls, labelCls } from "@/components/ui";

export default function SearchForm({
  action,
}: {
  action: (prev: InternshipSearchState, fd: FormData) => Promise<InternshipSearchState>;
}) {
  const [state, formAction] = useActionState<InternshipSearchState, FormData>(action, {});

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className={labelCls} htmlFor="q">What role or skill are you hunting?</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="q"
            name="q"
            type="search"
            placeholder="e.g. React, data analyst, ML, SDE…"
            required
            className={inputCls}
          />
          <SubmitButton className="shrink-0" pendingLabel="Searching…">Find internships</SubmitButton>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {SUGGESTED_ROLES.map((role) => (
            <button
              key={role}
              type="submit"
              name="q"
              value={role}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {role}
            </button>
          ))}
        </div>
        {state.error && <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900">{state.error}</p>}
      </form>

      {state.results && state.results.length === 0 && (
        <p className="text-sm text-slate-500">Nothing found — try a broader term.</p>
      )}

      {state.results && state.results.length > 0 && (
        <div className="space-y-3">
          {state.results.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-slate-900">{r.title}</h3>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">{r.source}</span>
              </div>
              {r.description && <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{r.description}</p>}
              <p className="mt-2 truncate text-xs text-slate-400">{r.url}</p>
            </a>
          ))}
          <p className="text-xs text-slate-400">
            Listings are found via live web search and link to the original posting — always apply there.
          </p>
        </div>
      )}
    </div>
  );
}
