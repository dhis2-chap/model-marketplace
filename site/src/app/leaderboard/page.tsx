import type { Metadata } from "next";
import Link from "next/link";
import { LeaderboardSuite } from "@/components/LeaderboardClient";
import { buildLeaderboardSuites, getBenchmarks } from "@/lib/benchmarks";
import { getRegistry } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Recorded chap eval runs against pinned commits on the CHAP reference datasets — nothing is self-reported.",
};

export default function LeaderboardPage() {
  const records = getBenchmarks();
  const suites = buildLeaderboardSuites(getRegistry(), records);
  const singleSplitSmoke = records.length === 1 && records[0].run?.splits === 1;

  return (
    <main>
      <section className="border-b border-line bg-gradient-to-b from-surface-2 to-surface">
        <div className="mx-auto grid max-w-[1240px] items-end gap-x-14 gap-y-10 px-8 pb-10 pt-14 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            <span className="font-brand text-[10px] font-medium uppercase tracking-[0.12em] text-exp">
              {records.length === 0
                ? "Waiting for the first run"
                : suites.length === 1
                  ? "Early results · one suite"
                  : `Early results · ${suites.length} suites`}
            </span>
            <h1 className="my-3.5 font-brand text-[40px] font-medium leading-[1.1] tracking-[-0.02em] text-ink">
              Leaderboard
            </h1>
            <p className="max-w-[62ch] text-[16px] leading-[1.65] text-ink-2">
              Every score on this page comes from a{" "}
              <span className="font-mono text-[14px]">chap eval</span> run
              against a pinned commit — nothing is self-reported.{" "}
              {records.length === 0
                ? "No run has been recorded yet, so there is nothing to rank — a suite appears the moment its first result lands, by pull request like everything else."
                : singleSplitSmoke
                  ? "Only one model has been evaluated so far, and it was a single-split smoke suite, so read this as provenance rather than a ranking. Rows without a run stay empty on purpose."
                  : `${records.length} runs have been recorded so far — still early, so read this as provenance rather than a ranking. Rows without a run stay empty on purpose.`}
            </p>
          </div>
          {suites.length === 1 ? (
            <div className="rounded-lg border border-line bg-surface px-5 py-[18px]">
              <div className="mb-3 font-brand text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
                Run context — identical for every row
              </div>
              <div>
                {suites[0].runContext.map((c) => (
                  <div
                    key={c.k}
                    className="flex items-baseline justify-between gap-4 border-t border-line py-[7px]"
                  >
                    <span className="text-[12.5px] text-ink-2">{c.k}</span>
                    <span className="text-right font-mono text-[12.5px] text-ink">
                      {c.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {suites.map((suite) => (
        <LeaderboardSuite key={suite.dataset} suite={suite} />
      ))}

      {suites.length === 0 ? (
        <section className="mx-auto max-w-[1240px] px-8 pt-9">
          <div className="rounded-lg border border-line bg-surface px-[26px] py-6">
            <div className="font-brand text-[15px] font-medium text-ink">
              Waiting for the first results
            </div>
            <p className="mt-1 max-w-[64ch] text-[13px] leading-[1.6] text-ink-2">
              This page renders recorded runs from the repo&apos;s{" "}
              <code className="font-mono text-[12px] text-ink">
                benchmarks/
              </code>{" "}
              directory — results land by pull request, like everything else.
              The first file defines the first suite; a row appears the moment
              a run lands.
            </p>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1240px] px-8 pb-24 pt-9">
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-5">
          <span className="text-[13px] text-ink-2">
            Per-model benchmark charts — horizon curves, baseline comparison,
            country breakdown — stay on each model&apos;s detail page.
          </span>
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-[4px] border border-line-strong bg-surface px-4 font-brand text-[13px] font-medium text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Browse models
          </Link>
        </div>
      </section>
    </main>
  );
}
