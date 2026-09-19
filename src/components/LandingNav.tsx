"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "For teams" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mql = window.matchMedia("(min-width: 768px)");
    const onDesktop = () => setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    mql.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      mql.removeEventListener("change", onDesktop);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Logo onClick={() => setOpen(false)} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Landing">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                solid ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className={`ml-3 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${
              solid
                ? "bg-brand-700 text-white hover:bg-brand-800"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            Sign in
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition md:hidden ${
            solid ? "text-slate-700 hover:bg-slate-100" : "text-slate-700 hover:bg-white/70"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="landing-mobile-menu" className="border-t border-slate-200/80 bg-white/95 px-4 pb-4 pt-2 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Landing mobile">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
