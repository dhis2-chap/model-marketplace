"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Dhis2Mark, GitHubMark, MagnifierIcon } from "./icons";
import { SoonPill } from "./badges";

function nav(benchmarksLive: boolean) {
  return [
    { href: "/", label: "Models", soon: false },
    { href: "/benchmarks", label: "Benchmarks", soon: !benchmarksLive },
    { href: "/contribute", label: "Contribute", soon: false },
    { href: "/docs", label: "Docs", soon: false },
  ];
}

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribeToTheme,
    () => document.documentElement.dataset.theme === "dark",
    () => false,
  );
  const toggle = () => {
    const next = !dark;
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("chap-mp-theme", next ? "dark" : "light");
    } catch {
      /* private mode */
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid h-8 w-8 cursor-pointer place-items-center rounded-[2px] border border-line bg-transparent text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
    >
      {dark ? (
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
          <circle cx={10} cy={10} r={3.6} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1={10}
              y1={1.5}
              x2={10}
              y2={4}
              transform={`rotate(${deg} 10 10)`}
            />
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M15.5 12.6A6 6 0 0 1 7.4 4.5a6.2 6.2 0 1 0 8.1 8.1Z" />
        </svg>
      )}
    </button>
  );
}

export function Header({ benchmarksLive }: { benchmarksLive: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };
  return (
    <>
      {/* Institutional microbar — scrolls away; the nav below stays. */}
      <div className="bg-board text-board-ink-2">
        <div className="mx-auto flex h-7 max-w-[1240px] items-center justify-between gap-4 px-8 font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className="truncate">HISP Centre · University of Oslo</span>
          <span className="hidden shrink-0 sm:block">
            A DHIS2 platform service
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex h-[62px] max-w-[1240px] items-center gap-8 px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Dhis2Mark className="h-[26px] w-auto text-brand" />
            <span className="flex flex-col leading-none">
              <span className="font-brand text-[17px] font-extrabold tracking-[-0.02em] text-ink">
                CHAP
              </span>
              <span className="mt-[3px] font-brand text-[8.5px] font-bold uppercase tracking-[0.26em] text-ink-3">
                Model Marketplace
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav(benchmarksLive).map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/" || pathname.startsWith("/models")
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-[22px] font-brand text-[11.5px] font-bold uppercase tracking-[0.1em] ${
                    item.soon ? "text-ink-3" : "text-ink-2"
                  } transition-colors hover:text-brand ${active ? "text-ink" : ""}`}
                >
                  {item.label}
                  {item.soon ? <SoonPill /> : null}
                  {active ? (
                    <span className="absolute inset-x-3 bottom-0 h-[3px] bg-brand" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <form onSubmit={submit} className="relative hidden flex-1 sm:block">
              <MagnifierIcon className="pointer-events-none absolute left-2.5 top-[9px] h-3.5 w-3.5 text-ink-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search models, frameworks, covariates"
                className="h-8 w-[220px] max-w-[260px] rounded-[2px] border border-line bg-surface-2 pl-[30px] pr-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:bg-surface lg:w-[260px]"
              />
            </form>
            <ThemeToggle />
            <a
              href="https://github.com/dhis2-chap"
              target="_blank"
              rel="noreferrer"
              className="flex h-8 items-center gap-1.5 rounded-[2px] border border-line px-3 font-brand text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              <GitHubMark className="h-3.5 w-3.5" />
              Repo
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
