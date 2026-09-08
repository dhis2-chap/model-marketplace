"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { BENCHMARKS_LIVE } from "@/lib/flags";
import type { ModelDetailView } from "@/lib/views";
import {
  AssessedStatusBadge,
  ChannelChip,
  Kicker,
  SoonPill,
  StatusBadge,
} from "./badges";
import { CodePanel } from "./CodePanel";
import { CopyButton, PinChip, useCopy } from "./copy";
import { CopyGlyph, SealIcon } from "./icons";
import { ComparisonChart, CrpsByHorizonChart } from "./charts";

type Tab = "overview" | "versions" | "configs" | "benchmarks" | "install";

const TABS: { id: Tab; label: string; soon?: boolean }[] = [
  { id: "overview", label: "Overview" },
  { id: "versions", label: "Versions" },
  { id: "configs", label: "Configurations" },
  { id: "benchmarks", label: "Benchmarks", soon: !BENCHMARKS_LIVE },
  { id: "install", label: "Install" },
];

function initials(handle: string): string {
  return handle.slice(0, 2).toUpperCase();
}

function Approvals({ v }: { v: ModelDetailView["versions"][number] }) {
  if (v.verifiedBy.length > 0) {
    return (
      <span className="flex items-center">
        {v.verifiedBy.map((name) => (
          <span
            key={name}
            title={name}
            className="-mr-1.5 grid h-[26px] w-[26px] place-items-center rounded-full border-[1.5px] border-surface bg-surface-3 font-brand text-[9.5px] font-medium text-ink-2"
          >
            {initials(name)}
          </span>
        ))}
        <span className="ml-4 text-[11.5px] text-ink-2">
          {v.verifiedBy.length}/3 approvals
        </span>
      </span>
    );
  }
  if (v.status === "verified") {
    return (
      <span className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
        <SealIcon className="h-3.5 w-3.5 text-verified" />
        3/3 · merge gate
      </span>
    );
  }
  return (
    <span className="text-[11.5px] text-ink-2">0/3 — awaiting review</span>
  );
}

function OverviewTab({ view, goInstall }: { view: ModelDetailView; goInstall: () => void }) {
  const required = view.requiredCovariates.length
    ? view.requiredCovariates.map((c) => [c, "supplied automatically"] as const)
    : ([["none", "the service declares no required covariates"]] as const);
  const additional: readonly (readonly [string, string])[] = view
    .defaultCovariates.length
    ? view.defaultCovariates.map(
        (c) => [c, "on by default — keep or clear it"] as const,
      )
    : view.allowFreeAdditional
      ? ([["any", "the service accepts free-form extras"]] as const)
      : ([["none", "the service accepts none"]] as const);
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <h2 className="mb-3 font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
          About this {view.kind}
        </h2>
        <p className="mb-3.5 max-w-[74ch] text-[15px] leading-[1.7] text-ink-2 [text-wrap:pretty]">
          {view.summary}
        </p>
        {view.kind === "template" ? (
          <p className="mb-3.5 max-w-[74ch] rounded-md border border-dashed border-exp bg-exp-tint px-3.5 py-2.5 text-[12.5px] leading-relaxed text-exp">
            This is a template, not a forecasting model. It is listed so model
            authors have a reviewed, running starting point to copy — do not
            deploy it to make real forecasts.
          </p>
        ) : null}

        {/* The author's own verdict, stated in their words, next to — and
            visibly distinct from — the marketplace's verification. */}
        <div className="mb-6 mt-6 rounded-md border border-line bg-surface p-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
            <AssessedStatusBadge status={view.assessedStatus} size="md" />
            <span className="font-brand text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-3">
              declared by the model authors
            </span>
          </div>
          <p className="max-w-[74ch] text-[13px] leading-[1.6] text-ink-2">
            {view.assessedBlurb} This is{" "}
            <strong className="font-bold text-ink">{view.attribution.author}</strong>
            &apos;s own assessment, read from the service&apos;s chapkit
            metadata — not a marketplace judgement. The three maintainer
            approvals on the pin say it is the revision it claims to be and
            runs as a chapkit service; they say nothing about forecast
            quality.
          </p>
        </div>

        <h3 className="mb-3 mt-7 font-brand text-[15px] font-medium text-ink">
          Covariates
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-line bg-surface p-4">
            <div className="mb-2.5 font-brand text-[10.5px] font-medium uppercase tracking-[0.1em] text-verified">
              Required · auto-supplied by chap
            </div>
            <div className="flex flex-col gap-2">
              {required.map(([name, note]) => (
                <div key={name} className="flex items-baseline gap-2">
                  <span className="font-mono text-[12.5px] text-ink">{name}</span>
                  <span className="text-[12px] text-ink-3">{note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-line bg-surface p-4">
            <div className="mb-2.5 font-brand text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-3">
              Additional continuous · you choose
            </div>
            <div className="flex flex-col gap-2">
              {additional.map(([name, note]) => (
                <div key={name} className="flex items-baseline gap-2">
                  <span className="font-mono text-[12.5px] text-ink">{name}</span>
                  <span className="text-[12px] text-ink-3">{note}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-line pt-2.5 text-[12px] leading-[1.5] text-ink-3">
              {view.allowFreeAdditional
                ? "The service allows free additional continuous covariates, so a configuration may name columns beyond the defaults."
                : "The service refuses free additional continuous covariates — anything not listed here is rejected when the configuration is created."}
            </p>
          </div>
        </div>

        {view.attribution.citation ? (
          <>
            <h3 className="mb-2.5 mt-7 font-brand text-[15px] font-medium text-ink">
              Citation
            </h3>
            <p className="max-w-[74ch] font-serif text-[13.5px] leading-[1.65] text-ink-2">
              {view.attribution.citation}
            </p>
          </>
        ) : null}
      </div>
      <div className="rounded-lg border border-line bg-surface-2 p-5">
        <Kicker className="mb-3.5">Service contract</Kicker>
        {(
          [
            ["Service id", view.serviceId],
            ["Period type", view.periodType],
            ["Forecast horizon", view.horizon],
            ["Needs geometry", view.requiresGeo ? "yes" : "no"],
            ["Framework", view.framework],
            ["Covariate mode", view.covLabel],
            ["chapkit", view.chapkitRequirement],
            ["Verified pins", String(view.verifiedPins)],
          ] as const
        ).map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between gap-4 border-b border-line py-2.5"
          >
            <span className="shrink-0 text-[13px] text-ink-2">{k}</span>
            <span className="min-w-0 truncate text-right font-mono text-[12.5px] text-ink">
              {v}
            </span>
          </div>
        ))}
        <div className="mt-3.5">
          <Kicker className="mb-2">Runtime base image</Kicker>
          <div className="font-mono text-[11.5px] leading-relaxed text-ink-2 [overflow-wrap:anywhere]">
            {view.runtimeImage}
          </div>
        </div>
        <div className="mt-3.5">
          <Kicker className="mb-2">Contact</Kicker>
          <div className="text-[12.5px] leading-relaxed text-ink-2">
            {view.attribution.organization ?? view.org}
            {view.attribution.contact ? (
              <>
                {" · "}
                <a
                  href={`mailto:${view.attribution.contact}`}
                  className="text-brand hover:underline [overflow-wrap:anywhere]"
                >
                  {view.attribution.contact}
                </a>
              </>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={goInstall}
          className="mt-[18px] h-[38px] w-full cursor-pointer rounded-[4px] bg-ink font-brand text-[13px] font-medium text-surface"
        >
          Add to your CHAP instance
        </button>
      </div>
    </div>
  );
}

/** Open-PR pins for this model: unverified until merged, shown with n/3. */
function InReviewSection({ view }: { view: ModelDetailView }) {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-dashed border-exp bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line bg-exp-tint px-[18px] py-3">
        <span className="font-brand text-[13px] font-medium text-ink">
          In review — proposed pins from open pull requests
        </span>
        {view.inReviewAsOf ? (
          <span className="font-mono text-[11px] text-ink-3">
            PR state as of the last site build · {view.inReviewAsOf}
          </span>
        ) : null}
      </div>
      {view.inReview.map((pin) => (
        <a
          key={`${pin.prNumber}-${pin.label}`}
          href={pin.prUrl}
          target="_blank"
          rel="noreferrer"
          className="grid items-center gap-3 border-b border-line px-[18px] py-3.5 last:border-b-0 hover:bg-surface-2 md:grid-cols-[130px_130px_150px_1fr_auto]"
        >
          <span className="font-mono text-[13.5px] font-bold text-ink">
            {pin.label}
            {pin.commitShort ? (
              <span className="ml-1.5 font-normal text-ink-3">
                @{pin.commitShort}
              </span>
            ) : null}
          </span>
          <span>
            <StatusBadge status="in review" />
          </span>
          <span className="font-mono text-[12px] text-exp">
            {pin.approvals} approvals
          </span>
          <span className="truncate text-[12.5px] text-ink-2">
            #{pin.prNumber} {pin.prTitle}
          </span>
          <span className="font-mono text-[11.5px] text-ink-3">
            by {pin.author} · {pin.updatedAt}
          </span>
        </a>
      ))}
      <p className="border-t border-line px-[18px] py-2.5 text-[11.5px] text-ink-3">
        A proposed pin becomes verified — and eligible for the{" "}
        <code className="font-mono text-ink-2">stable</code> channel — only
        when its pull request merges with three approvals.
      </p>
    </div>
  );
}

const VERSION_GRID =
  "grid-cols-[110px_minmax(200px,1fr)_minmax(190px,0.8fr)_106px_170px_90px_80px]";

function VersionsTab({
  view,
  onInstall,
}: {
  view: ModelDetailView;
  onInstall: (tag: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <div>
      {view.inReview.length > 0 ? <InReviewSection view={view} /> : null}
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="mb-1.5 font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
            Version pins
          </h2>
          <p className="max-w-[80ch] text-[13.5px] text-ink-2">
            Each row is one revision, reviewed on its own: a git commit and the
            container image built from it. The image is tagged{" "}
            <code className="font-mono text-[12.5px] text-ink">
              sha-&lt;short commit&gt;
            </code>
            , so the two halves can never drift apart — and neither is{" "}
            <code className="font-mono text-[12.5px] text-ink">:latest</code>.
            Only verified pins may be pointed at by the{" "}
            <code className="font-mono text-[12.5px] text-ink">stable</code>{" "}
            channel.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="font-brand text-[22px] font-medium leading-none text-verified">
              {view.verifiedPins}
            </div>
            <div className="mt-1 text-[11px] text-ink-3">verified</div>
          </div>
          <div className="w-px bg-line" />
          <div className="text-right">
            <div className="font-brand text-[22px] font-medium leading-none text-ink">
              {view.reviews}
            </div>
            <div className="mt-1 text-[11px] text-ink-3">reviews</div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <div className="min-w-[1020px]">
          <div
            className={`grid ${VERSION_GRID} gap-4 border-b border-line bg-surface-2 px-[18px] py-2.5 font-brand text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3`}
          >
            <span>Version</span>
            <span>Commit pin</span>
            <span>Image</span>
            <span>Status</span>
            <span>Approved by</span>
            <span className="text-right">Changelog</span>
            <span className="text-right">Install</span>
          </div>
          {view.versions.map((v) => {
            const hasDetails = Boolean(v.changelog || v.notes);
            const open = expanded[v.tag];
            return (
              <div
                key={v.tag}
                className={`border-b border-line last:border-b-0 ${
                  v.isStable
                    ? "bg-verified-tint [box-shadow:inset_3px_0_0_var(--mp-verified)]"
                    : "bg-surface"
                }`}
              >
                <div
                  className={`grid ${VERSION_GRID} items-center gap-4 px-[18px] py-4`}
                >
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[13.5px] font-bold text-ink">
                      {v.tag}
                    </span>
                    {v.isStable ? <ChannelChip channel="stable" /> : null}
                    {v.isLatest && !v.isStable ? (
                      <ChannelChip channel="latest" />
                    ) : null}
                  </span>
                  <span>
                    <PinChip display={v.pinDisplay} copyText={v.pinFull} variant="table" />
                  </span>
                  <span>
                    <PinChip
                      display={`:${v.imageTag}`}
                      copyText={v.image}
                      variant="table"
                    />
                  </span>
                  <span>
                    <StatusBadge status={v.status} />
                  </span>
                  <Approvals v={v} />
                  <span className="text-right">
                    {hasDetails ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((e) => ({ ...e, [v.tag]: !e[v.tag] }))
                        }
                        className="h-7 cursor-pointer rounded-[3px] border border-line bg-transparent px-2.5 font-brand text-[11.5px] font-medium text-ink-2 hover:border-line-strong"
                      >
                        {open ? "Hide" : "Details"}
                      </button>
                    ) : (
                      <span className="text-[11.5px] text-ink-3">—</span>
                    )}
                  </span>
                  <span className="text-right">
                    <button
                      type="button"
                      onClick={() => onInstall(v.tag)}
                      title={`Installation guide for ${v.tag} @ ${v.pinDisplay.split("@")[1]}`}
                      className="h-7 cursor-pointer rounded-[3px] border border-line bg-transparent px-2.5 font-brand text-[11.5px] font-medium text-brand hover:border-brand"
                    >
                      Install
                    </button>
                  </span>
                </div>
                {open ? (
                  <div className="px-[18px] pb-5">
                    <div className="border-l-2 border-line-strong pl-[18px]">
                      {v.changelog ? (
                        <div className="mb-3">
                          <Kicker className="mb-2">Changelog</Kicker>
                          <p className="max-w-[80ch] text-[13.5px] leading-relaxed text-ink-2">
                            {v.changelog}
                          </p>
                        </div>
                      ) : null}
                      {v.notes ? (
                        <div>
                          <Kicker className="mb-2">Notes</Kicker>
                          <p className="max-w-[80ch] text-[13.5px] leading-relaxed text-ink-2">
                            {v.notes}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3.5 font-mono text-[12px] text-ink-3">
        source: models/{view.id}.yaml — history rendered from git
      </p>
    </div>
  );
}

function ConfigsTab({ view }: { view: ModelDetailView }) {
  return (
    <div>
      <h2 className="mb-1.5 font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
        Verified configurations
      </h2>
      <p className="mb-6 max-w-[80ch] text-[13.5px] text-ink-2">
        Configuration blocks shipped and reviewed alongside the pin. Each one
        is the flat object a chapkit service takes as{" "}
        <code className="font-mono text-[12.5px] text-ink">data</code> on{" "}
        <code className="font-mono text-[12.5px] text-ink">
          POST /api/v1/configs
        </code>{" "}
        —{" "}
        <code className="font-mono text-[12.5px] text-ink">
          prediction_periods
        </code>{" "}
        is required by chapkit itself, everything else is this model&apos;s own
        option set. CHAP and the DHIS2 Modeling App create configurations the
        same way.
      </p>
      <div className="flex flex-col gap-5">
        {view.configurations.map((config) => (
          <div
            key={config.key}
            className="overflow-hidden rounded-lg border border-line bg-surface"
          >
            <div className="grid items-center gap-5 border-b border-line px-[18px] py-4 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2.5">
                  <span className="font-brand text-[15px] font-medium text-ink">
                    {config.key}
                  </span>
                  <span className="rounded-[3px] bg-verified-tint px-[7px] py-[2px] font-mono text-[11px] text-verified">
                    verified · {view.stable.pinDisplay.split("@")[1]}
                  </span>
                </div>
                <p className="max-w-[86ch] text-[13px] leading-relaxed text-ink-2">
                  {config.description}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <CopyButton text={config.yaml} label="Copy YAML" size="md" />
                <CopyButton text={config.curl} label="Copy request" size="md" />
              </div>
            </div>
            <CodePanel code={config.yaml} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BenchmarksTab({ view }: { view: ModelDetailView }) {
  if (!BENCHMARKS_LIVE) {
    return (
      <div>
        <div className="mb-1.5 flex items-center gap-2.5">
          <h2 className="font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
            Benchmarks
          </h2>
          <SoonPill label="coming soon" />
        </div>
        <p className="mb-6 max-w-[80ch] text-[13.5px] text-ink-2">
          Benchmark results are not published yet — no benchmarks have been
          run, and exactly how they will be run is still being decided. Once
          that is settled, every score here will come from a controlled CHAP
          evaluation of this model&apos;s pinned commits — nothing
          self-reported. Until then the only quality signal on this page is
          the author&apos;s own assessed status, on the Overview tab.
        </p>
        <div className="rounded-lg border border-dashed border-line-strong bg-surface px-[26px] py-6">
          <div className="font-brand text-[15px] font-medium text-ink">
            What will appear here
          </div>
          <p className="mt-1 max-w-[72ch] text-[13px] leading-[1.6] text-ink-2">
            CRPS by forecast horizon against the seasonal-naive baseline, a
            cross-model comparison on the shared reference datasets, and the
            full run record — dataset, harness, runtime — for every evaluated
            pin.
          </p>
        </div>
      </div>
    );
  }

  const b = view.benchmarks;
  if (!b) {
    return (
      <p className="text-[13.5px] text-ink-2">
        No benchmark record yet for this model. Results land in the repo&apos;s{" "}
        <code className="font-mono text-[12.5px] text-ink">benchmarks/</code>{" "}
        directory by pull request, like everything else.
      </p>
    );
  }
  const p = b.provenance;
  const benchmarkSummary = view.benchmarkSummary;
  return (
    <div>
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="mb-1.5 font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
            Benchmarks
          </h2>
          <p className="max-w-[80ch] text-[13.5px] text-ink-2">
            Continuous ranked probability score (CRPS) — lower is better.
            Evaluated on the CHAP reference datasets with rolling-origin
            backtests at the pinned commit.
          </p>
        </div>
        <span className="inline-block rounded-[3px] border border-verified bg-verified-tint px-[9px] py-[5px] font-mono text-[11px] text-verified">
          measured · {p.dataset} @ {p.versionTag}
        </span>
      </div>
      <p className="mb-[18px] font-mono text-[12px] text-ink-3">
        evaluated {p.evaluatedAt} · {p.harnessTool}
        {p.runUrl ? (
          <>
            {" · "}
            <a
              href={p.runUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline"
            >
              raw output
            </a>
          </>
        ) : null}
        {" · "}source: benchmarks/{view.id}/{p.versionTag}/{p.dataset}.yaml
      </p>
      {b.headline.length > 0 ? (
        <div className="mb-5 grid grid-cols-2 gap-4 rounded-lg border border-line bg-surface-2 px-5 py-4 sm:grid-cols-4">
          {b.headline.map((h) => (
            <div key={h.label}>
              <div className="font-brand text-[22px] font-medium leading-none text-ink">
                {h.value}
              </div>
              <div className="mt-1.5 font-brand text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
                {h.label}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {b.crpsByHorizon.length > 0 ? (
          <div className="rounded-lg border border-line bg-surface p-[18px]">
            <div className="font-brand text-[13.5px] font-medium text-ink">
              CRPS by forecast horizon
            </div>
            <div className="mb-3.5 text-[11.5px] text-ink-3">
              {b.baseline.length > 0
                ? "This model vs. the seasonal-naive baseline"
                : "This model"}
            </div>
            <CrpsByHorizonChart
              crps={b.crpsByHorizon}
              baseline={b.baseline}
              shortName={view.shortName}
            />
          </div>
        ) : null}
        {b.comparison.length > 0 ? (
          <div className="rounded-lg border border-line bg-surface p-[18px]">
            <div className="font-brand text-[13.5px] font-medium text-ink">
              Model comparison
            </div>
            <div className="mb-3.5 text-[11.5px] text-ink-3">
              Mean CRPS · {p.dataset}
            </div>
            <ComparisonChart items={b.comparison} />
          </div>
        ) : null}
      </div>
      <Link
        href="/benchmarks"
        className="mt-5 grid items-center gap-6 rounded-lg border border-dashed border-line-strong bg-surface-2 px-[26px] py-[22px] transition-colors hover:border-brand md:grid-cols-[1fr_auto]"
      >
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <span className="font-brand text-[16px] font-medium text-ink">
              Cross-model benchmarks
            </span>
            {benchmarkSummary ? (
              <span className="whitespace-nowrap rounded-full border border-line-strong px-2 py-[3px] font-brand text-[9.5px] font-medium uppercase tracking-[0.08em] text-ink-3">
                {benchmarkSummary.measured} of {benchmarkSummary.listed} evaluated
              </span>
            ) : (
              <SoonPill label="coming soon" />
            )}
          </div>
          <p className="max-w-[80ch] text-[13px] text-ink-2">
            {benchmarkSummary
              ? `Recorded chap eval runs on ${
                  benchmarkSummary.suiteNames.length === 1
                    ? `the shared ${benchmarkSummary.suiteNames[0]} suite`
                    : `${benchmarkSummary.suiteNames.length} reference suites`
                } — ${
                  benchmarkSummary.measured === 1
                    ? "one model"
                    : `${benchmarkSummary.measured} models`
                } measured so far, the rest empty until a run lands.`
              : "Every verified pin scored on the same datasets, ranked, with per-country breakdowns and ensemble contributions."}
          </p>
        </div>
        <span className="font-brand text-[13px] font-medium text-brand">
          {benchmarkSummary ? "Open benchmarks →" : "Preview the design →"}
        </span>
      </Link>
    </div>
  );
}

function InstallTab({
  view,
  selectedTag,
  onSelect,
}: {
  view: ModelDetailView;
  selectedTag: string;
  onSelect: (tag: string) => void;
}) {
  const { copied, copy } = useCopy();
  const selected = view.versions.find((v) => v.tag === selectedTag) ?? null;
  const image = selected?.image ?? view.stable.image;
  const pinDisplay = selected?.pinDisplay ?? view.stable.pinDisplay;
  const shortPin = pinDisplay.split("@")[1];
  const tag = selected?.tag ?? view.stable.tag;
  const verified = selected ? selected.status === "verified" : true;
  const overlay = `compose.${view.serviceId}.yml`;
  const configExample = view.configurations[0];
  const steps = [
    {
      title: verified ? "Pull the verified image" : "Pull the image",
      cmd: `docker pull ${image}`,
      note: "The sha- tag is built from the pinned commit, so it names one immutable revision. :latest moves; do not deploy it.",
    },
    {
      title: "Add a compose overlay next to chap-core",
      cmd: `$EDITOR ${overlay}`,
      note: `One service block: image ${image}, container port 8000 on a free host port, and SERVICEKIT_ORCHESTRATOR_URL pointing at chap. The service name must be unique across overlays — use ${view.serviceId}.`,
    },
    {
      title: "Start the stack",
      cmd: `docker compose -f compose.yml -f ${overlay} up -d`,
      note: "The model self-registers with chap-core on startup and keeps the registration alive with a periodic ping. Registration only happens when SERVICEKIT_ORCHESTRATOR_URL is set — a bare docker run registers nothing.",
    },
    {
      title: "Confirm chap-core sees it",
      cmd: `curl -s http://localhost:8000/v2/services | grep ${view.serviceId}`,
      note: `Look for the service id ${view.serviceId}. Once it is listed, the DHIS2 Modeling App picks the model up automatically — nothing to configure inside DHIS2.`,
    },
  ];
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.35fr_1fr]">
      <div>
        <h2 className="mb-1.5 font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
          Add to your CHAP instance
        </h2>
        <p className="mb-[18px] max-w-[76ch] text-[13.5px] text-ink-2">
          The marketplace lists chapkit services only. Every listing is a
          published container image that talks to CHAP over HTTP and registers
          itself with chap-core on startup. Run it beside your CHAP
          deployment; the pin is the contract — the same commit, and the image
          tagged from it, produce the same service everywhere.
        </p>
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <Kicker>Version pin</Kicker>
          {view.versions.map((v) => {
            const active = v.tag === tag;
            return (
              <button
                key={v.tag}
                type="button"
                onClick={() => onSelect(v.tag)}
                title={v.pinDisplay}
                className={`h-7 cursor-pointer rounded-[4px] border px-2.5 font-mono text-[12px] transition-colors ${
                  active
                    ? "border-ink bg-ink text-surface"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong"
                }`}
              >
                {v.tag}
                {v.isStable ? (
                  <span
                    className={`ml-1.5 font-brand text-[9px] font-medium uppercase tracking-[0.06em] ${
                      active ? "text-surface/70" : "text-verified"
                    }`}
                  >
                    stable
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {!verified ? (
          <p className="mb-3.5 max-w-[76ch] rounded-md border border-dashed border-exp bg-exp-tint px-3.5 py-2.5 text-[12.5px] leading-relaxed text-exp">
            {tag} has not passed the 3/3 review gate — run this pin for
            evaluation and development only, never on a production instance.
          </p>
        ) : null}
        {view.kind === "template" ? (
          <p className="mb-3.5 max-w-[76ch] rounded-md border border-dashed border-exp bg-exp-tint px-3.5 py-2.5 text-[12.5px] leading-relaxed text-exp">
            This is a template. Running it is useful to see the round trip
            work end to end; the forecasts it produces are placeholders.
          </p>
        ) : null}
        {view.requiresGeo ? (
          <p className="mb-3.5 max-w-[76ch] rounded-md border border-line-strong bg-surface-2 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-2">
            This service requires geometry: chap has to send a GeoJSON
            alongside the data, so the dataset must carry org-unit boundaries.
          </p>
        ) : null}
        <div className="overflow-hidden rounded-lg border border-line bg-code-bg">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-[11px]">
            <span className="h-[9px] w-[9px] rounded-full bg-[#FF5F57]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#FEBC2E]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#28C840]" />
            <span className="ml-2 font-mono text-[11.5px] text-[#8A93A6]">
              {view.serviceId} · {tag} @ {shortPin}
            </span>
          </div>
          <div className="px-5 pb-[22px] pt-[18px]">
            {steps.map((step, i) => (
              <div key={step.title} className="grid grid-cols-[auto_1fr] gap-3.5 pb-[18px]">
                <span className="grid h-[22px] w-[22px] place-items-center rounded-full border border-white/20 font-mono text-[11px] text-[#A7B0C2]">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="mb-2 text-[13.5px] text-[#E4E9F2]">
                    {step.title}
                  </div>
                  <div className="overflow-x-auto whitespace-nowrap">
                    <span className="whitespace-pre font-mono text-[12.5px] text-[#8FD79A]">
                      {step.cmd}
                    </span>
                    <span className="ml-1 inline-block h-3.5 w-[7px] bg-[#8FD79A] align-middle [animation:mp-blink_1.1s_step-end_infinite]" />
                  </div>
                  <div className="mt-2 text-[12px] text-[#7D879B]">{step.note}</div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => copy(image)}
              className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-white/15 bg-white/5 font-brand text-[12.5px] font-medium text-[#D8DEE9] transition-colors hover:bg-white/10"
            >
              <CopyGlyph className="h-3 w-3" />
              {copied === image ? "Copied" : `Copy ${tag} image ref`}
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-line bg-surface-2 p-5">
          <Kicker className="mb-3.5">Which channel should I run?</Kicker>
          <div className="mb-3 flex gap-3">
            <span className="w-[52px] shrink-0 font-mono text-[12px] font-bold text-verified">
              stable
            </span>
            <span className="text-[13px] leading-[1.55] text-ink-2">
              Production instances. Always a pin with three approvals.
            </span>
          </div>
          <div className="flex gap-3">
            <span className="w-[52px] shrink-0 font-mono text-[12px] font-bold text-ink-2">
              latest
            </span>
            <span className="text-[13px] leading-[1.55] text-ink-2">
              Evaluation and development only — may point at an unreviewed
              commit.
            </span>
          </div>
        </div>
        {configExample ? (
          <div className="rounded-lg border border-line bg-surface-2 p-5">
            <Kicker className="mb-2.5">Then create a configuration</Kicker>
            <p className="text-[13px] leading-relaxed text-ink-2">
              A running service holds no configuration until one is created.
              The{" "}
              <code className="font-mono text-[12.5px] text-ink">
                {configExample.key}
              </code>{" "}
              block on the Configurations tab is a reviewed starting point, and
              copies as the request that creates it.
            </p>
          </div>
        ) : null}
        <div className="rounded-lg border border-line p-5">
          <Kicker className="mb-3.5">Full instructions</Kicker>
          <p className="text-[13px] leading-relaxed text-ink-2">
            The compose overlay, the registration environment variables, host
            port conventions and the troubleshooting list live in{" "}
            <a
              href="https://dhis2-chap.github.io/chapkit/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-brand hover:text-brand-dark hover:underline"
            >
              chapkit
            </a>
            &apos;s own deployment guide. Only chapkit services are supported.
          </p>
          <a
            href={view.installUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-[13px] font-bold text-brand hover:text-brand-dark hover:underline"
          >
            chapkit → deploying to chap-core
          </a>
        </div>
      </div>
    </div>
  );
}

export function ModelDetailTabs({
  view,
  header,
}: {
  view: ModelDetailView;
  header: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [installTag, setInstallTag] = useState<string>(view.stable.tag);
  const openInstall = (tag: string) => {
    setInstallTag(tag);
    setTab("install");
  };
  return (
    <>
      <div className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-[22px]">
          {header}
          <div className="no-scrollbar -mx-5 flex gap-0.5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 border-b-[3px] bg-transparent px-3 pb-3 pt-[11px] font-brand text-[12px] font-bold uppercase tracking-[0.07em] sm:px-4 ${
                  tab === t.id
                    ? "border-brand text-ink"
                    : "border-transparent text-ink-2 hover:text-ink"
                }`}
              >
                {t.label}
                {t.soon ? <SoonPill /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-[1240px] px-5 sm:px-8 pb-20 pt-9">
        {tab === "overview" ? (
          <OverviewTab
            view={view}
            goInstall={() => openInstall(view.stable.tag)}
          />
        ) : null}
        {tab === "versions" ? (
          <VersionsTab view={view} onInstall={openInstall} />
        ) : null}
        {tab === "configs" ? <ConfigsTab view={view} /> : null}
        {tab === "benchmarks" ? <BenchmarksTab view={view} /> : null}
        {tab === "install" ? (
          <InstallTab
            view={view}
            selectedTag={installTag}
            onSelect={setInstallTag}
          />
        ) : null}
      </main>
    </>
  );
}
