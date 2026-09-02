// Server-safe presentational helpers — no client-only APIs here.
const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  brand: "bg-brand-50 text-brand-700 ring-brand-500/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  indigo: "bg-brand-50 text-brand-700 ring-brand-500/20",
  blue: "bg-brand-50 text-brand-700 ring-brand-500/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export function Badge({ tone = "slate", children }: { tone?: keyof typeof TONES | string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone] ?? TONES.slate}`}>
      {children}
    </span>
  );
}

export const STATUS_TONE: Record<string, string> = {
  DRAFT: "slate", PUBLISHED: "green", CLOSED: "amber", COMPLETED: "blue",
  APPLIED: "blue", IN_PROGRESS: "violet", SELECTED: "green", REJECTED: "red",
  OFFERED: "indigo", OFFER_ACCEPTED: "green", OFFER_DECLINED: "red",
  ISSUED: "indigo", ACCEPTED: "green", DECLINED: "red",
  PENDING: "amber", NEXT_ROUND: "violet", ABSENT: "red",
  SCHEDULED: "slate", ANNOUNCED: "green",
  ONLINE: "blue", OFFLINE: "amber",
};

export function pretty(s: string) {
  return s.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-brand-500/70" />
      <p className={`${overlineCls} text-slate-500`}>{label}</p>
      <p className="mt-1.5 font-display text-3xl tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
        {actions}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
export const labelCls = "block text-xs font-medium text-slate-600 mb-1";
export const overlineCls = "font-display text-[13px] font-medium uppercase tracking-[0.06em]";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
}
