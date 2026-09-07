import Link from "next/link";
import { Dhis2Mark } from "./icons";

function buildStamp(): string {
  const date = new Date().toISOString().slice(0, 10);
  const sha = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7);
  return sha ? `${date} · ${sha}` : `${date} · local`;
}

const LinkClass =
  "text-board-ink-2 transition-colors hover:text-board-ink hover:underline";

export function Footer() {
  return (
    <footer className="board-grid border-t-[3px] border-brand text-board-ink">
      <div className="mx-auto grid max-w-[1240px] gap-x-10 gap-y-10 px-8 pb-10 pt-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Dhis2Mark className="h-6 w-auto text-fan" />
            <span className="flex flex-col leading-none">
              <span className="font-brand text-[18px] font-extrabold tracking-[-0.02em]">
                CHAP
              </span>
              <span className="mt-[3px] font-brand text-[8.5px] font-bold uppercase tracking-[0.26em] text-board-ink-2">
                Model Marketplace
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-[44ch] font-serif text-[13.5px] leading-[1.7] text-board-ink-2">
            Climate &amp; Health Analytics Platform — developed by the HISP
            Centre at the University of Oslo. The catalog is rendered from a
            public git repository; the repository is the source of truth.
          </p>
        </div>
        <div>
          <div className="mb-3.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-fan">
            Marketplace
          </div>
          <ul className="space-y-2.5 text-[13px]">
            <li>
              <Link href="/" className={LinkClass}>
                Models
              </Link>
            </li>
            <li>
              <Link href="/contribute" className={LinkClass}>
                Contribute
              </Link>
            </li>
            <li>
              <Link href="/benchmarks" className={LinkClass}>
                Benchmarks
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-fan">
            Platform
          </div>
          <ul className="space-y-2.5 text-[13px]">
            <li>
              <a href="https://chap.dhis2.org" target="_blank" rel="noreferrer" className={LinkClass}>
                chap.dhis2.org
              </a>
            </li>
            <li>
              <a href="https://dhis2.org/climate" target="_blank" rel="noreferrer" className={LinkClass}>
                DHIS2 for climate &amp; health
              </a>
            </li>
            <li>
              <a href="mailto:climate@dhis2.org" className={LinkClass}>
                climate@dhis2.org
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-8 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-board-ink-2">
          <span>HISP Centre · University of Oslo</span>
          <span>catalog build {buildStamp()}</span>
        </div>
      </div>
    </footer>
  );
}
