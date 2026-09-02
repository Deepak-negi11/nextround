"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import type { SessionUser } from "@/lib/auth";

const NAV: Record<SessionUser["role"], { href: string; label: string }[]> = {
  STUDENT: [
    { href: "/student", label: "Dashboard" },
    { href: "/student/drives", label: "Drives" },
    { href: "/student/applications", label: "My Applications" },
    { href: "/student/offers", label: "Offers" },
    { href: "/student/profile", label: "My Profile" },
    { href: "/student/roadmaps", label: "Senior Roadmaps" },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/drives", label: "Drives" },
    { href: "/admin/companies", label: "Companies" },
    { href: "/admin/reports", label: "Reports" },
  ],
  INTERVIEWER: [{ href: "/interviewer", label: "My Rounds" }],
};

const ROLE_LABEL: Record<SessionUser["role"], string> = {
  STUDENT: "Student",
  ADMIN: "Placement Admin",
  INTERVIEWER: "Interviewer / Recruiter",
};

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-500" aria-hidden />
      <span className="font-display text-2xl font-semibold tracking-tight text-slate-900">NextRound</span>
    </Link>
  );
}

function NavLinks({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const links = NAV[user.role];
  const isActive = (href: string) =>
    href.split("/").length <= 2 ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex-1 space-y-1 px-3 py-4" aria-label={ROLE_LABEL[user.role]}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onNavigate}
          aria-current={isActive(l.href) ? "page" : undefined}
          className={`relative block rounded-lg px-3 py-2 text-sm transition ${
            isActive(l.href)
              ? "bg-brand-50 font-semibold text-brand-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {isActive(l.href) && (
            <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-brand-500" aria-hidden />
          )}
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

function SidebarBody({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  return (
    <>
      <div className="border-b border-slate-200 px-5 py-5">
        <Brand />
        <p className="mt-0.5 text-xs text-slate-400">Campus Placement Portal</p>
      </div>
      <NavLinks user={user} onNavigate={onNavigate} />
      <div className="border-t border-slate-200 px-5 py-4">
        <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-400">{ROLE_LABEL[user.role]}</p>
        <form action={logout} className="mt-3">
          <button className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

export default function Sidebar({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        openButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <SidebarBody user={user} />
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Brand />
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="app-mobile-drawer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div id="app-mobile-drawer" className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] translate-x-0 flex-col border-r border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <NavLinks user={user} onNavigate={() => setOpen(false)} />
            <div className="border-t border-slate-200 px-5 py-4">
              <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-400">{ROLE_LABEL[user.role]}</p>
              <form action={logout} className="mt-3">
                <button className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
