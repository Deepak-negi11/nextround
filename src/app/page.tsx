import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, CalendarDays, ClipboardCheck, ListChecks, Route, ShieldCheck } from "lucide-react";
import { getSessionUser, homeFor } from "@/lib/auth";
import LandingNav from "@/components/LandingNav";
import { Logo } from "@/components/Logo";
import { overlineCls } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATS = [
  { value: "100%", label: "Eligibility-checked drives" },
  { value: "4+", label: "Round types per drive" },
  { value: "3", label: "Roles, one portal" },
  { value: "1:1", label: "Senior roadmaps to offers" },
];

const STEPS = [
  {
    n: "01",
    title: "Admin opens a drive",
    desc: "Company, role, package and eligibility criteria go in; the drive publishes to the right students automatically.",
  },
  {
    n: "02",
    title: "Rounds run, live",
    desc: "Aptitude to final interview — slots and panels assigned, outcomes recorded by interviewers in real time.",
  },
  {
    n: "03",
    title: "Offers land",
    desc: "Selected students get the offer, accept or decline it, and their roadmap becomes the next senior's guide.",
  },
];

const ROLES = [
  {
    role: "Students",
    desc: "See only the drives you're eligible for, track every application, and read the roadmaps of seniors who made it.",
    accent: "from-brand-500 to-brand-700",
  },
  {
    role: "Placement Admin",
    desc: "Run companies, drives, rounds, slots and offers from one console — with analytics that update themselves.",
    accent: "from-brand-600 to-brand-800",
  },
  {
    role: "Interviewers",
    desc: "Get your panel, your slots and your candidates — record outcomes the moment an interview ends.",
    accent: "from-brand-400 to-brand-600",
  },
];

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect(homeFor(user.role));

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <LandingNav />

      <main>
      {/* Hero */}
      <section className="relative">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-44 pt-36 text-center md:px-8 md:pb-52 md:pt-44">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-brand-500 ring-1 ring-inset ring-brand-500/20">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
            Campus placement portal
          </p>
          <h1 className="mt-6 max-w-3xl font-display font-medium text-5xl leading-none tracking-[-0.02em] md:text-[64px]">
            Your next offer starts
            <br />
            at the <span>next round.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-[1.5] text-slate-600 md:text-lg">
            Eligibility-checked drives, flexible interview rounds, live outcomes and senior
            roadmaps — everything a placement cell needs, in one portal.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="shadow-brand-500/20">
              <Link href="/login">Sign in to the portal</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/60">
              <a href="#how">
                See how it works
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 5v14m0 0l-6-6m6 6l6-6" />
                </svg>
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-24 max-w-6xl px-4 md:-mt-32 md:px-8">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 text-center shadow-lg shadow-slate-900/5">
              <dt className="order-2 mt-1 text-xs text-slate-500">{s.label}</dt>
              <dd className="order-1 font-display text-3xl tracking-tight text-brand-600">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 md:px-8">
        <p className={`${overlineCls} text-brand-600`}>Features</p>
        <h2 className="mt-2 max-w-xl text-balance font-display text-4xl leading-[1.1] tracking-tight md:text-5xl">
          Built for how placements <em className="font-semibold">actually</em> work.
        </h2>
        {/* Bento grid */}
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {/* Eligibility — wide cell with a live-gate preview */}
          <Card className="p-6 md:col-span-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <CardTitle className="mt-4 text-xl">Eligibility-checked drives</CardTitle>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Students only see the companies they actually qualify for — no noise, no false hope.
            </p>
            <div className="mt-6 space-y-2" aria-hidden>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs">
                <span>Aarav Sharma · CSE · CGPA 8.6</span>
                <Badge>Eligible</Badge>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs">
                <span>Ishita Verma · ECE · CGPA 6.2</span>
                <Badge variant="outline">CGPA below 7.0</Badge>
              </div>
            </div>
          </Card>

          {/* Rounds — flow list */}
          <Card className="p-6 md:col-span-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              <ListChecks className="h-4 w-4" />
            </span>
            <CardTitle className="mt-4 text-xl">Flexible rounds</CardTitle>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Any order, online or offline.</p>
            <ol className="mt-6 space-y-1.5" aria-hidden>
              {["Aptitude test", "Online coding", "Group discussion", "Technical interview", "HR interview"].map((round, i) => (
                <li key={round} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-secondary font-mono text-[10px] text-foreground">{i + 1}</span>
                  {round}
                </li>
              ))}
            </ol>
          </Card>

          {/* Logistics — slots preview */}
          <Card className="p-6 md:col-span-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              <CalendarDays className="h-4 w-4" />
            </span>
            <CardTitle className="mt-4 text-xl">Round logistics</CardTitle>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Slots, panels and venues per round.</p>
            <div className="mt-6 space-y-2" aria-hidden>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
                <span className="font-mono">09:30</span>
                <Badge>Booked</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
                <span className="font-mono">10:30</span>
                <Badge variant="outline">Open</Badge>
              </div>
            </div>
          </Card>

          {/* Outcomes */}
          <Card className="p-6 md:col-span-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <CardTitle className="mt-4 text-xl">Outcomes & offers</CardTitle>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Interviewers record results live.</p>
            <div className="mt-6 flex flex-wrap gap-2" aria-hidden>
              <Badge>Selected</Badge>
              <Badge variant="secondary">Next round</Badge>
              <Badge variant="outline">Rejected</Badge>
            </div>
          </Card>

          {/* Analytics — mini bar chart */}
          <Card className="p-6 md:col-span-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              <BarChart3 className="h-4 w-4" />
            </span>
            <CardTitle className="mt-4 text-xl">Live analytics</CardTitle>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Reports write themselves.</p>
            <div className="mt-6 flex h-20 items-end gap-2" aria-hidden>
              {[40, 70, 55, 90, 65].map((height, i) => (
                <div key={i} className="w-full rounded-t-sm bg-primary" style={{ height: `${height}%` }} />
              ))}
            </div>
          </Card>

          {/* Roadmaps — full-width timeline */}
          <Card className="p-6 md:col-span-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <Route className="h-4 w-4" />
                </span>
                <CardTitle className="mt-4 text-xl">Senior roadmaps</CardTitle>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Real journeys from seniors who landed the offer — the exact rounds and prep that worked.
                </p>
              </div>
              <ol className="flex flex-1 items-center gap-2 text-xs text-muted-foreground" aria-hidden>
                {["2nd yr: DSA", "3rd yr: intern", "Interviews", "PPO · 50 LPA"].map((step, i, arr) => (
                  <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">{i + 1}</span>
                    <span className="whitespace-nowrap">{step}</span>
                    {i < arr.length - 1 && <span className="h-px flex-1 bg-border" />}
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative scroll-mt-24 py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className={`${overlineCls} text-brand-600`}>How it works</p>
          <h2 className="mt-2 max-w-xl text-balance font-display text-3xl font-medium leading-[1.15] tracking-[-0.01em] md:text-[40px]">
            Drive to offer, in <em className="font-semibold">three moves.</em>
          </h2>
          <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
            {STEPS.map((s) => (
              <li key={s.n} className="relative rounded-xl border border-brand-100 bg-white p-6 shadow-xs">
                <span className="font-display text-4xl font-medium text-slate-300">{s.n}</span>
                <h3 className="mt-3 font-display text-2xl font-medium leading-[1.25] tracking-tight text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 md:px-8">
        <p className={`${overlineCls} text-brand-600`}>For teams</p>
        <h2 className="mt-2 max-w-xl text-balance font-display text-4xl leading-[1.1] tracking-tight md:text-5xl">
          One portal, <em className="font-semibold">every seat</em> at the table.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {ROLES.map((r) => (
            <article key={r.role} className="overflow-hidden rounded-xl border border-slate-200/80 shadow-xs">
              <div className={`h-2 bg-gradient-to-r ${r.accent}`} aria-hidden />
              <div className="bg-white p-6">
                <h3 className="font-display text-2xl font-medium tracking-tight">{r.role}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{r.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center md:px-8">
          <h2 className="text-balance font-display text-3xl font-medium leading-[1.15] tracking-[-0.01em] md:text-[40px]">
            Make the <em className="font-semibold">next round</em> yours.
          </h2>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-slate-600 md:text-base">
            Sign in with your college account — students, placement admins and interviewers
            each land exactly where they need to be.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:-translate-y-0.5 hover:bg-brand-700"
          >
            Sign in
          </Link>
        </div>
      </section>
      </main>

      <footer className="border-t border-slate-200/80 py-10 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:px-8 md:text-left">
          <Logo />
          <p className="text-xs">Placement drives · Rounds · Offers · Roadmaps — for your campus.</p>
        </div>
      </footer>
    </div>
  );
}
