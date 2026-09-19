// Shared app-level components composed from the shadcn/ui primitives.
// These keep the legacy APIs (Badge tone, Card title/actions, PageHeader, StatCard)
// so every internal page inherits the shadcn styling without individual refactors.
import { cn } from "@/lib/utils";
import { Badge as BadgePrimitive } from "./badge";
import { Card as CardPrimitive, CardContent } from "./card";

// Monochrome two-tier mapping: positive/live states get the solid chip,
// neutral/negative states get the soft gray chip.
const TONE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  green: "default",
  blue: "default",
  indigo: "default",
  brand: "default",
  red: "secondary",
  amber: "secondary",
  violet: "secondary",
  slate: "outline",
};

export function Badge({ tone = "slate", children }: { tone?: string; children: React.ReactNode }) {
  return <BadgePrimitive variant={TONE_VARIANT[tone] ?? "outline"}>{children}</BadgePrimitive>;
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
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
      <p className={`${overlineCls} text-muted-foreground`}>{label}</p>
      <p className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Card({ title, children, actions, className }: { title: string; children: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <CardPrimitive className={className}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{title}</h2>
        {actions}
      </div>
      <CardContent className="p-5">{children}</CardContent>
    </CardPrimitive>
  );
}

export const inputCls =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
export const labelCls = "block text-[13px] font-medium leading-none text-foreground";
export const overlineCls = "font-display text-[13px] font-medium uppercase tracking-[0.06em]";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-medium leading-[1.15] tracking-[-0.01em] text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
}

export { cn };
