"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Dhis2Mark, GitHubMark, MagnifierIcon } from "./icons";
import { SoonPill } from "./badges";

interface NavItem {
  href: string;
  label: string;
  soon: boolean;
}

function nav(benchmarksLive: boolean): NavItem[] {
  return [
    { href: "/", label: "Models", soon: false },
    { href: "/benchmarks", label: "Benchmarks", soon: !benchmarksLive },
    { href: "/contribute", label: "Contribute", soon: false },
    { href: "/docs", label: "Docs", soon: false },
  ];
}

function isActive(href: string, pathname: string): boolean {
  return href === "/"
    ? pathname === "/" || pathname.startsWith("/models")
    : pathname.startsWith(href);
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
      className="grid h-9 w-9 cursor-pointer place-items-center rounded-[2px] border border-line bg-transparent text-ink-2 transition-colors hover:border-line-strong hover:text-ink sm:h-8 sm:w-8"
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

/** Three rules, folding into a cross — the board's own line weight. */
function MenuGlyph({ open }: { open: boolean }) {
  const bar = (y: number, rotate: number | null) => (
    <line
      key={y}
      x1={2.5}
      y1={y}
      x2={17.5}
      y2={y}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="square"
      className="origin-center transition-[transform,opacity] duration-200"
      style={
        open
          ? rotate === null
            ? { opacity: 0 }
            : { transform: `translateY(${10 - y}px) rotate(${rotate}deg)` }
          : undefined
      }
    />
  );
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden>
      {bar(5, 45)}
      {bar(10, null)}
      {bar(15, -45)}
    </svg>
  );
}

/**
 * Below `md` the nav collapses behind this button into a full-width sheet
 * under the header: the same four destinations, the search field the
 * desktop bar carries, and the repo link.
 */
function MobileNav({
  items,
  pathname,
  q,
  setQ,
  onSubmit,
}: {
  items: NavItem[];
  pathname: string;
  q: string;
  setQ: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const [open, setOpen] = useState(false);

  // The sheet is a route-level control: any navigation closes it.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Widening past `md` reveals the real nav bar and hides the sheet with
    // CSS alone — close it so the scroll lock goes with it.
    const desktop = window.matchMedia("(min-width: 768px)");
    const onDesktop = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mp-mobile-nav"
        className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-[2px] border border-line bg-transparent text-ink-2 transition-colors hover:border-line-strong hover:text-ink md:hidden"
      >
        <MenuGlyph open={open} />
      </button>

      {open ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen(false)}
          className="absolute inset-x-0 top-full z-30 h-[100dvh] cursor-default bg-board/35 md:hidden"
        />
      ) : null}

      <div
        id="mp-mobile-nav"
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 max-h-[72dvh] overflow-y-auto border-b border-line bg-surface shadow-lift md:hidden"
      >
        <nav className="flex flex-col px-5 py-2">
          {items.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 border-b border-line py-3.5 font-brand text-[14px] font-bold uppercase tracking-[0.1em] last:border-b-0 ${
                  active
                    ? "text-brand [box-shadow:inset_3px_0_0_var(--mp-brand)] pl-3"
                    : item.soon
                      ? "text-ink-3"
                      : "text-ink-2"
                }`}
              >
                {item.label}
                {item.soon ? <SoonPill /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line bg-surface-2 px-5 py-4">
          <form
            onSubmit={(e) => {
              onSubmit(e);
              setOpen(false);
            }}
            className="relative"
          >
            <MagnifierIcon className="pointer-events-none absolute left-3 top-[13px] h-4 w-4 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search models"
              aria-label="Search models"
              className="h-11 w-full rounded-[2px] border border-line bg-surface pl-9 pr-3 text-[16px] text-ink outline-none placeholder:text-ink-3 focus:border-brand"
            />
          </form>
          <a
            href="https://github.com/dhis2-chap"
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-11 items-center justify-center gap-2 rounded-[2px] border border-line-strong font-brand text-[12px] font-bold uppercase tracking-[0.08em] text-ink-2"
          >
            <GitHubMark className="h-3.5 w-3.5" />
            Repository
          </a>
        </div>
      </div>
    </>
  );
}

export function Header({ benchmarksLive }: { benchmarksLive: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const items = nav(benchmarksLive);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };
  return (
    <>
      {/* Institutional microbar — scrolls away; the nav below stays. */}
      <div className="bg-board text-board-ink-2">
        <div className="mx-auto flex h-7 max-w-[1240px] items-center justify-between gap-4 px-5 font-mono text-[10px] uppercase tracking-[0.14em] sm:px-8">
          <span className="truncate">HISP Centre · University of Oslo</span>
          <span className="hidden shrink-0 sm:block">
            A DHIS2 platform service
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex h-[62px] max-w-[1240px] items-center gap-4 px-5 sm:px-8 lg:gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3">
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
            {items.map((item) => {
              const active = isActive(item.href, pathname);
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
          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            <form onSubmit={submit} className="relative hidden flex-1 md:block">
              <MagnifierIcon className="pointer-events-none absolute left-2.5 top-[9px] h-3.5 w-3.5 text-ink-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search models, frameworks, covariates"
                className="h-8 w-[200px] max-w-[260px] rounded-[2px] border border-line bg-surface-2 pl-[30px] pr-2.5 text-[12.5px] text-ink outline-none placeholder:text-ink-3 focus:border-brand focus:bg-surface lg:w-[260px]"
              />
            </form>
            <ThemeToggle />
            <a
              href="https://github.com/dhis2-chap"
              target="_blank"
              rel="noreferrer"
              className="hidden h-8 items-center gap-1.5 rounded-[2px] border border-line px-3 font-brand text-[11px] font-bold uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-line-strong hover:text-ink md:flex"
            >
              <GitHubMark className="h-3.5 w-3.5" />
              Repo
            </a>
            <MobileNav
              items={items}
              pathname={pathname}
              q={q}
              setQ={setQ}
              onSubmit={submit}
            />
          </div>
        </div>
      </header>
    </>
  );
}
