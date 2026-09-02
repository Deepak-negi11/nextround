import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser, homeFor } from "@/lib/auth";
import LandingNav from "@/components/LandingNav";
import { overlineCls } from "@/components/ui";

const STATS = [
  { value: "100%", label: "Eligibility-checked drives" },
  { value: "4+", label: "Round types per drive" },
  { value: "3", label: "Roles, one portal" },
  { value: "1:1", label: "Senior roadmaps to offers" },
];

const FEATURES = [
  {
    title: "Eligibility-checked drives",
    desc: "Students only see the companies they actually qualify for — no noise, no false hope.",
    path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Flexible rounds",
    desc: "Aptitude, coding, group discussions, interviews — online or offline, in any order.",
    path: "M4 6h16M4 12h10M4 18h7",
  },
  {
    title: "Round logistics",
    desc: "Slots, panels and venues scheduled per round, so interview day just works.",
    path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Outcomes & offers",
    desc: "Interviewers record outcomes live; offers roll out the moment a round closes.",
    path: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
  {
    title: "Live placement analytics",
    desc: "Drives, rounds and offers tracked end-to-end, so reports write themselves.",
    path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Senior roadmaps",
    desc: "Real journeys from seniors who landed the offer — the exact rounds and prep that worked.",
    path: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
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
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:bg-brand-600"
            >
              Sign in to the portal
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-semibold text-slate-800 ring-1 ring-inset ring-slate-900/15 transition hover:bg-white/60"
            >
              See how it works
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14m0 0l-6-6m6 6l6-6" />
              </svg>
            </a>
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
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={f.path} />
                </svg>
              </span>
              <h3 className="mt-4 font-display text-2xl font-medium leading-[1.25]">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
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
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-500" aria-hidden />
            <span className="font-display text-xl font-semibold tracking-tight text-slate-900">NextRound</span>
          </div>
          <p className="text-xs">Placement drives · Rounds · Offers · Roadmaps — for your campus.</p>
        </div>
      </footer>
    </div>
  );
}
