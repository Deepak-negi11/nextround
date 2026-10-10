// Shown instantly while a dashboard page loads its data (via each section's loading.tsx),
// so navigation responds on click instead of freezing until the database answers.
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-slate-200" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-200/70" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-slate-200 bg-white p-5">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-14 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="h-3 w-32 rounded bg-slate-200" />
        </div>
        <div className="space-y-4 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
