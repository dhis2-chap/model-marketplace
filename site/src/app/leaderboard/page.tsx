import type { Metadata } from "next";
import Link from "next/link";
import { getRegistry, shortCommit, stableVersion } from "@/lib/registry";
import { mockBenchmarksFor } from "@/lib/mock-benchmarks";
import { presentationFor } from "@/lib/presentation";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "One leaderboard, every verified pin — coming soon. The scoring harness is being finalised.",
};

/** Mock rows behind the blur — purely a shape preview of the page to come. */
function mockRows() {
  const registry = getRegistry();
  return registry.models
    .map((m) => {
      const mocks = mockBenchmarksFor(m.id);
      const skill = mocks
        ? mocks.countrySkill.reduce((s, [, v]) => s + v, 0) /
          mocks.countrySkill.length
        : 0;
      return {
        id: m.id,
        name: m.display_name,
        pin: `@${shortCommit(stableVersion(m).commit)}`,
        crps: mocks?.comparisonMean ?? 0,
        mae: 11 + skill * 12,
        coverage: 0.75 + skill * 0.2,
        skill,
        shortName: presentationFor(m.id).shortName,
      };
    })
    .sort((a, b) => b.skill - a.skill);
}

export default function LeaderboardPage() {
  const rows = mockRows();
  return (
    <main className="mx-auto max-w-[1240px] px-8 pb-24 pt-18">
      <div className="mb-9 max-w-[64ch]">
        <div className="font-brand text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3">
          Coming soon
        </div>
        <h1 className="my-3.5 font-brand text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-ink md:text-[40px]">
          One leaderboard, every verified pin
        </h1>
        <p className="text-[16px] leading-[1.65] text-ink-2">
          Standardised backtests across the CHAP reference datasets, so a
          ministry analyst can pick a model on evidence rather than reputation.
          The scoring harness is being finalised — the shape of the page is
          below.
        </p>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-line bg-surface">
        <div className="pointer-events-none opacity-50 blur-[2.5px]" aria-hidden>
          <div className="grid grid-cols-[48px_1fr_120px_120px_120px_90px] gap-4 border-b border-line bg-surface-2 px-5 py-3 font-brand text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
            <span>#</span>
            <span>Model · pin</span>
            <span>CRPS</span>
            <span>MAE</span>
            <span>Coverage 80%</span>
            <span>Skill</span>
          </div>
          {rows.map((row, i) => (
            <div
              key={row.id}
              className="grid grid-cols-[48px_1fr_120px_120px_120px_90px] items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0"
            >
              <span className="font-mono text-[13px] text-ink-3">{i + 1}</span>
              <span className="text-[13.5px] text-ink">
                {row.name}{" "}
                <span className="font-mono text-[11.5px] text-ink-3">
                  {row.pin}
                </span>
              </span>
              <span className="font-mono text-[13px] text-ink">
                {row.crps.toFixed(2)}
              </span>
              <span className="font-mono text-[13px] text-ink-2">
                {row.mae.toFixed(1)}
              </span>
              <span className="font-mono text-[13px] text-ink-2">
                {row.coverage.toFixed(2)}
              </span>
              <span className="font-mono text-[13px] text-verified">
                +{row.skill.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-md border border-line-strong bg-surface px-[26px] py-5 text-center shadow-lift">
            <div className="font-brand text-[15px] font-medium text-ink">
              Scoring harness in review
            </div>
            <p className="mt-1 text-[13px] text-ink-2">
              Per-model benchmarks are already on each detail page.
            </p>
            <Link
              href="/"
              className="mt-3.5 inline-flex h-[34px] items-center rounded-[4px] border border-line-strong bg-surface px-4 font-brand text-[13px] font-medium text-ink hover:border-brand hover:text-brand"
            >
              Browse models
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
