import type { Metadata } from "next";
import Link from "next/link";
import { BenchmarkSuites } from "@/components/BenchmarksClient";
import {
  buildBenchmarkSuites,
  getBenchmarks,
  getMetricDefinitions,
} from "@/lib/benchmarks";
import { BENCHMARKS_LIVE } from "@/lib/flags";
import { getRegistry } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "Benchmark results are added soon — controlled Chap evaluations against pinned commits, nothing self-reported.",
};

/** Rendered until real benchmark results exist — the methodology is still being decided. */
function BenchmarksComingSoon() {
  return (
    <main>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-11 sm:px-8 sm:pb-12 sm:pt-16">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-exp">
            Coming soon
          </span>
          <h1 className="my-4 font-brand text-[clamp(36px,4vw,50px)] font-medium leading-[1.02] text-ink">
            Benchmarks
          </h1>
          <p className="max-w-[58ch] text-[16px] leading-[1.7] text-ink-2">
            Every score on this page will come from a controlled Chap
            evaluation of a pinned commit — nothing self-reported. No
            benchmarks have been run yet, and exactly how they will be run is
            still being decided, so results are not published yet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-9">
        <div className="d2-card px-[26px] py-6">
          <div className="font-brand text-[15px] font-medium text-ink">
            What will appear here
          </div>
          <p className="mt-1 max-w-[72ch] text-[13px] leading-[1.6] text-ink-2">
            One ranked table per reference dataset, with a full run record
            behind every row. The exact datasets, metrics and run parameters
            will be documented once the methodology is settled. Results are
            read from Chap&apos;s benchmarking server each time the site is
            published.
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
            className="d2-button"
          >
            Browse models
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function BenchmarksPage() {
  const records = getBenchmarks();
  if (!BENCHMARKS_LIVE || records.length === 0) return <BenchmarksComingSoon />;

  const suites = buildBenchmarkSuites(getRegistry(), records, getMetricDefinitions());
  const singleSplitSmoke = records.length === 1 && records[0].run?.splits === 1;

  return (
    <main>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-11 sm:px-8 sm:pt-16">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-exp">
              {records.length === 0
                ? "Waiting for the first run"
                : suites.length === 1
                  ? "Early results · one suite"
                  : `Early results · ${suites.length} suites`}
            </span>
            <h1 className="my-4 font-brand text-[clamp(36px,4vw,50px)] font-medium leading-[1.02] text-ink">
              Benchmarks
            </h1>
            <p className="max-w-[58ch] text-[16px] leading-[1.7] text-ink-2">
              Every score on this page comes from a controlled Chap evaluation
              of a pinned commit — nothing is self-reported.{" "}
              {records.length === 0
                ? "No run has been recorded yet, so there is nothing to rank — a suite appears once its first result is published."
                : singleSplitSmoke
                  ? "Only one model has been evaluated so far, over a single backtest split, so read this as provenance rather than a ranking. Rows without a run stay empty on purpose."
                  : `${records.length} runs have been recorded so far — still early, so read this as provenance rather than a ranking. Rows without a run stay empty on purpose.`}
            </p>
          </div>
        </div>
      </section>

      <BenchmarkSuites suites={suites} />

      {suites.length > 0 ? (
        <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-9">
          <div className="d2-card px-[26px] py-6">
            <div className="font-brand text-[15px] font-medium text-ink">
              Methodology — added soon
            </div>
            <p className="mt-1 max-w-[72ch] text-[13px] leading-[1.6] text-ink-2">
              Exactly how the benchmark suites are run — harness, datasets,
              isolation, backtest parameters, ranking — is still being
              decided. A full methodology description will be published here
              and in the repo&apos;s{" "}
              <code className="font-mono text-[12px] text-ink">
                benchmarks/README.md
              </code>{" "}
              once it is settled. Until then, each row&apos;s run record
              documents what was actually recorded for it.
            </p>
            <a
              href="https://chap.dhis2.org/chap-modeling-platform/external_models/running_models_in_chap/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex font-brand text-[12.5px] font-medium text-brand hover:text-brand-dark"
            >
              Read the Chap evaluation documentation ↗
            </a>
          </div>
        </section>
      ) : null}

      {suites.length === 0 ? (
        <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-9">
          <div className="d2-card px-[26px] py-6">
            <div className="font-brand text-[15px] font-medium text-ink">
              Waiting for the first results
            </div>
            <p className="mt-1 max-w-[64ch] text-[13px] leading-[1.6] text-ink-2">
              This page renders the runs read from Chap&apos;s benchmarking
              server each time the site is published. A row appears once a
              listed model&apos;s run has been published.
            </p>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pb-24 pt-9">
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-5">
          <span className="text-[13px] text-ink-2">
            Each model&apos;s detail page shows its best configuration&apos;s
            metrics and how it compares with the other listed models.
          </span>
          <Link
            href="/"
            className="d2-button"
          >
            Browse models
          </Link>
        </div>
      </section>
    </main>
  );
}
