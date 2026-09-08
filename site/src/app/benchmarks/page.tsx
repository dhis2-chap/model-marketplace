import type { Metadata } from "next";
import Link from "next/link";
import { BenchmarkSuite } from "@/components/BenchmarksClient";
import { buildBenchmarkSuites, getBenchmarks } from "@/lib/benchmarks";
import { BENCHMARKS_LIVE } from "@/lib/flags";
import { getRegistry } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "Benchmark results are added soon — controlled CHAP evaluations against pinned commits, nothing self-reported.",
};

/** Rendered until real benchmark results exist — the methodology is still being decided. */
function BenchmarksComingSoon() {
  return (
    <main>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 pb-12 pt-16">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-exp">
            Coming soon
          </span>
          <h1 className="my-4 font-brand text-[clamp(36px,4vw,50px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
            Benchmarks
          </h1>
          <p className="max-w-[58ch] font-serif text-[16px] leading-[1.7] text-ink-2">
            Every score on this page will come from a controlled CHAP
            evaluation of a pinned commit — nothing self-reported. No
            benchmarks have been run yet, and exactly how they will be run is
            still being decided, so results are not published yet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-9">
        <div className="rounded-lg border border-dashed border-line-strong bg-surface px-[26px] py-6">
          <div className="font-brand text-[15px] font-medium text-ink">
            What will appear here
          </div>
          <p className="mt-1 max-w-[72ch] text-[13px] leading-[1.6] text-ink-2">
            One ranked table per reference dataset, with a full run record
            behind every row. The exact datasets, metrics and run parameters
            will be documented once the methodology is settled. Results land
            in the repo&apos;s{" "}
            <code className="font-mono text-[12px] text-ink">benchmarks/</code>{" "}
            directory by pull request, like everything else.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pb-24 pt-9">
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-5">
          <span className="text-[13px] text-ink-2">
            Per-model benchmark charts get the same treatment — they appear on
            each model&apos;s detail page together with the first recorded
            runs.
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

export default function BenchmarksPage() {
  if (!BENCHMARKS_LIVE) return <BenchmarksComingSoon />;

  const records = getBenchmarks();
  const suites = buildBenchmarkSuites(getRegistry(), records);
  const singleSplitSmoke = records.length === 1 && records[0].run?.splits === 1;

  return (
    <main>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-[1240px] items-end gap-x-14 gap-y-10 px-5 sm:px-8 pb-10 pt-16 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-exp">
              {records.length === 0
                ? "Waiting for the first run"
                : suites.length === 1
                  ? "Early results · one suite"
                  : `Early results · ${suites.length} suites`}
            </span>
            <h1 className="my-4 font-brand text-[clamp(36px,4vw,50px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
              Benchmarks
            </h1>
            <p className="max-w-[58ch] font-serif text-[16px] leading-[1.7] text-ink-2">
              Every score on this page comes from a controlled CHAP evaluation
              of a pinned commit — nothing is self-reported.{" "}
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
        <BenchmarkSuite key={suite.dataset} suite={suite} />
      ))}

      {suites.length === 0 ? (
        <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-9">
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

      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pb-24 pt-9">
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
