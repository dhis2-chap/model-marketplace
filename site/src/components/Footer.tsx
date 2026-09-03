import Link from "next/link";
import { Dhis2Mark } from "./icons";

function buildStamp(): string {
  const date = new Date().toISOString().slice(0, 10);
  const sha = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7);
  return sha ? `${date} · ${sha}` : `${date} · local`;
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-8 py-9 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div>
          <div className="flex items-center gap-2.5">
            <Dhis2Mark className="h-5 w-auto text-brand" />
            <span className="font-brand text-[13px] font-bold text-ink">
              CHAP Model Marketplace
            </span>
          </div>
          <p className="mt-3 max-w-[46ch] text-[12.5px] leading-relaxed text-ink-2">
            Climate &amp; Health Analytics Platform — developed by the HISP
            Centre at the University of Oslo. The catalog is rendered from a
            public git repository; the repository is the source of truth.
          </p>
        </div>
        <div>
          <div className="mb-3 font-brand text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
            Marketplace
          </div>
          <ul className="space-y-2 text-[12.5px]">
            <li>
              <Link href="/" className="text-brand hover:text-brand-dark hover:underline">
                Models
              </Link>
            </li>
            <li>
              <Link href="/contribute" className="text-brand hover:text-brand-dark hover:underline">
                Contribute
              </Link>
            </li>
            <li>
              <Link href="/benchmarks" className="text-brand hover:text-brand-dark hover:underline">
                Benchmarks
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-brand text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
            Platform
          </div>
          <ul className="space-y-2 text-[12.5px]">
            <li>
              <a href="https://chap.dhis2.org" target="_blank" rel="noreferrer" className="text-brand hover:text-brand-dark hover:underline">
                chap.dhis2.org
              </a>
            </li>
            <li>
              <a href="https://dhis2.org/climate" target="_blank" rel="noreferrer" className="text-brand hover:text-brand-dark hover:underline">
                DHIS2 for climate &amp; health
              </a>
            </li>
            <li>
              <a href="mailto:climate@dhis2.org" className="text-brand hover:text-brand-dark hover:underline">
                climate@dhis2.org
              </a>
            </li>
          </ul>
        </div>
        <div className="text-right font-mono text-[11px] leading-relaxed text-ink-3">
          catalog build
          <br />
          {buildStamp()}
        </div>
      </div>
    </footer>
  );
}
