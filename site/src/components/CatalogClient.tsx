"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import type { InReviewPinView, ModelCardView } from "@/lib/views";
import { MaturityBadge, VerifiedInline } from "./badges";
import { PinChip } from "./copy";
import { MagnifierIcon, SealIcon } from "./icons";
import { Sparkline } from "./Sparkline";

type SetFilter = "all" | "stable" | "experimental";
type Filters = Partial<Record<"period" | "cov" | "fw", string>>;

const CHIPS: { label: string; key: keyof Filters; val: string }[] = [
  { label: "monthly", key: "period", val: "monthly" },
  { label: "climate-driven", key: "cov", val: "climate" },
  { label: "no covariates", key: "cov", val: "none" },
  { label: "python", key: "fw", val: "python" },
  { label: "R / INLA", key: "fw", val: "inla" },
];

function matches(m: ModelCardView, q: string, filters: Filters): boolean {
  if (q) {
    const hay =
      `${m.name} ${m.summary} ${m.framework} ${m.repo} ${m.covLabel}`.toLowerCase();
    if (!hay.includes(q.toLowerCase())) return false;
  }
  if (filters.period && !m.periodType.includes(filters.period)) return false;
  if (filters.cov === "climate" && !["climate", "both"].includes(m.covMode))
    return false;
  if (filters.cov === "none" && !["none", "both"].includes(m.covMode))
    return false;
  if (filters.fw && !m.framework.toLowerCase().includes(filters.fw))
    return false;
  return true;
}

/** A restrained catalog entry; maturity is communicated by its badge. */
function ModelCard({ m }: { m: ModelCardView }) {
  return (
    <Link
      href={`/models/${m.id}`}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors duration-150 hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3 px-[18px] pt-5">
        <div className="min-w-0">
          <h3 className="mb-[6px] font-brand text-[19px] font-bold leading-[1.15] tracking-[-0.015em] text-ink">
            {m.name}
          </h3>
          <div className="truncate font-mono text-[11px] text-ink-3">{m.repo}</div>
        </div>
        <MaturityBadge maturity={m.maturity} />
      </div>
      <div className="px-[18px] pt-3.5">
        <VerifiedInline approvals={m.approvals} detail={m.framework} />
      </div>
      <p className="flex-1 px-[18px] pt-3 text-[13.5px] leading-[1.6] text-ink-2 [text-wrap:pretty]">
        {m.summary}
      </p>
      <div className="flex flex-wrap gap-1.5 px-[18px] pt-4">
        {[m.periodType, m.covLabel, m.horizon ? `horizon ${m.horizon}` : null]
          .filter(Boolean)
          .map((tag) => (
            <span
              key={tag}
              className="rounded-[2px] bg-surface-3 px-[7px] py-[3px] font-mono text-[10.5px] text-ink-2"
            >
              {tag}
            </span>
          ))}
      </div>
      {m.spark.length > 0 ? (
        <div className="px-[18px] pt-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">
              {m.sparkLabel}
            </span>
            <span className="font-mono text-[11px] text-ink-2">
              {m.spark[m.spark.length - 1].toFixed(2)}
            </span>
          </div>
          <Sparkline values={m.spark} />
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line px-[18px] py-3">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-verified">
            {m.stableTag}
          </span>
          <PinChip display={m.stablePinDisplay} copyText={m.stablePinFull} />
        </span>
        <span className="shrink-0 font-brand text-[12px] font-bold text-brand">
          View model →
        </span>
      </div>
    </Link>
  );
}

export interface MarketplaceStatsView {
  models: number;
  verifiedPins: number;
  reviews: number;
}

/** Open proposals from PR ingestion — in-review pins with their n/3 count. */
function InReviewStrip({
  pins,
  asOf,
}: {
  pins: InReviewPinView[];
  asOf: string | null;
}) {
  return (
    <div className="mt-10 overflow-hidden rounded-[3px] border border-dashed border-exp bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line bg-exp-tint px-5 py-3">
        <span className="font-brand text-[13px] font-bold text-ink">
          In review — open proposals
        </span>
        <span className="font-mono text-[11px] text-ink-3">
          {asOf ? `PR state as of the last site build · ${asOf}` : null}
        </span>
      </div>
      {pins.map((pin) => (
        <a
          key={`${pin.prNumber}-${pin.modelId}-${pin.label}`}
          href={pin.prUrl}
          target="_blank"
          rel="noreferrer"
          className="grid items-center gap-3 border-b border-line px-5 py-3 last:border-b-0 hover:bg-surface-2 md:grid-cols-[minmax(200px,1fr)_110px_1fr_auto]"
        >
          <span className="flex items-baseline gap-2">
            <span className="font-mono text-[13px] font-bold text-ink">
              {pin.catalogLabel}
            </span>
            {pin.commitShort ? (
              <span className="font-mono text-[11.5px] text-ink-3">
                @{pin.commitShort}
              </span>
            ) : null}
            {pin.isNewModel ? (
              <span className="rounded-[2px] border border-dashed border-exp bg-exp-tint px-[6px] py-[2px] font-brand text-[9.5px] font-bold uppercase tracking-[0.06em] text-exp">
                new model
              </span>
            ) : null}
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
    </div>
  );
}

export function CatalogClient({
  models,
  stats,
  heroChart,
  inReview,
  inReviewAsOf,
}: {
  models: ModelCardView[];
  stats: MarketplaceStatsView;
  heroChart: ReactNode;
  inReview: InReviewPinView[];
  inReviewAsOf: string | null;
}) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [set, setSet] = useState<SetFilter>("all");
  const [q, setQ] = useState(urlQuery);
  const [filters, setFilters] = useState<Filters>({});
  // Adopt a new header-search query mid-session (state adjusted during render).
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setQ(urlQuery);
  }

  const counts = useMemo(
    () => ({
      all: models.length,
      stable: models.filter((m) => m.maturity === "stable").length,
      experimental: models.filter((m) => m.maturity === "experimental").length,
    }),
    [models],
  );

  const visible = models.filter(
    (m) => (set === "all" || m.maturity === set) && matches(m, q, filters),
  );
  const anyFilter = q !== "" || Object.values(filters).some(Boolean);

  const toggleChip = (key: keyof Filters, val: string) =>
    setFilters((f) => ({ ...f, [key]: f[key] === val ? undefined : val }));
  const clearAll = () => {
    setFilters({});
    setQ("");
  };

  const TABS: { id: SetFilter; label: string; bar: string }[] = [
    { id: "all", label: "All sets", bar: "bg-ink" },
    { id: "stable", label: "Stable", bar: "bg-verified" },
    { id: "experimental", label: "Experimental", bar: "bg-exp" },
  ];

  const STATS = [
    [stats.models, "Models listed", "text-ink"],
    [stats.verifiedPins, "Verified version pins", "text-ink"],
    [stats.reviews, "Maintainer reviews", "text-ink"],
  ] as const;

  return (
    <>
      {/* Introduction and a compact forecast illustration. */}
      <section className="relative overflow-hidden border-b border-line bg-surface text-ink">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid items-end gap-x-14 gap-y-4 pt-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="pb-10">
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                <span className="text-brand">Review-gated registry</span>
                <span className="text-ink-2">git-backed · chapkit-run</span>
              </div>
              <h1 className="mb-6 max-w-[15ch] font-brand text-[clamp(34px,4vw,50px)] font-semibold leading-[1.1] tracking-[-0.03em] [text-wrap:balance]">
                Verified forecasting models for climate &amp; health
              </h1>
              <p className="mb-9 max-w-[46ch] text-[15px] leading-[1.7] text-ink-2">
                Every model and every version pin in the CHAP marketplace is
                reviewed and approved by three maintainers before it is listed.
                Pin a commit, run it in your CHAP instance, reproduce the
                result.
              </p>
              <div className="relative max-w-[520px]">
                <MagnifierIcon className="pointer-events-none absolute left-4 top-4 h-[18px] w-[18px] text-ink-3" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Search ${stats.models} verified models — try “INLA” or “no covariates”`}
                  aria-label="Search models"
                  className="h-13 w-full rounded-md border border-line-strong bg-paper pl-11 pr-4 text-[14px] text-ink placeholder:text-ink-3 focus:border-brand"
                />
              </div>
            </div>
            <div className="hidden self-end pb-9 lg:block">{heroChart}</div>
          </div>
        </div>
        {/* Registry totals. */}
        <div className="relative border-t border-line">
          <div className="mx-auto grid max-w-[1240px] grid-cols-3 gap-x-5 px-5 sm:px-8 sm:flex sm:items-stretch sm:gap-x-0">
            {STATS.map(([n, label, tone], i) => (
              <div
                key={label}
                className={`flex flex-col justify-start py-5 sm:justify-center sm:pr-10 ${
                  i > 0 ? "sm:border-l sm:border-line sm:pl-10" : ""
                }`}
              >
                <div
                  className={`font-brand text-[24px] font-semibold leading-none tracking-[-0.02em] ${tone}`}
                >
                  {n}
                </div>
                <div className="mt-2 text-[12px] text-ink-2">
                  {label}
                </div>
              </div>
            ))}
            <div className="ml-auto hidden items-center font-mono text-[11px] text-ink-2 lg:flex">
              source of truth: registry.yaml @ main
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar + grid */}
      <section className="mx-auto max-w-[1240px] px-5 pb-20 pt-8 sm:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-6 border-b border-line-strong">
          <div className="flex gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSet(tab.id)}
                className={`relative flex cursor-pointer items-center gap-2 whitespace-nowrap bg-transparent px-4 pb-3.5 pt-2.5 font-brand text-[13px] font-medium ${
                  set === tab.id ? "text-ink" : "text-ink-2"
                }`}
              >
                {tab.label}
                <span className="font-mono text-[11px] font-normal normal-case tracking-normal text-ink-3">
                  {counts[tab.id]}
                </span>
                {set === tab.id ? (
                  <span className={`absolute inset-x-0 -bottom-px h-[3px] ${tab.bar}`} />
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              Filter
            </span>
            {CHIPS.map((chip) => {
              const active = filters[chip.key] === chip.val;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => toggleChip(chip.key, chip.val)}
                  className={`h-7 cursor-pointer rounded-[2px] border px-[11px] font-mono text-[11.5px] transition-colors ${
                    active
                      ? "border-brand bg-brand-tint text-brand"
                      : "border-line bg-surface text-ink-2 hover:border-line-strong"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
            {anyFilter ? (
              <button
                type="button"
                onClick={clearAll}
                className="h-7 cursor-pointer bg-transparent px-2.5 font-brand text-[12px] font-bold text-brand"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <p className="mb-[18px] font-mono text-[11.5px] text-ink-3">
          {visible.length} {visible.length === 1 ? "model" : "models"} · every
          pin below carries three maintainer approvals
        </p>

        {visible.length > 0 ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))]">
            {visible.map((m) => (
              <ModelCard key={m.id} m={m} />
            ))}
          </div>
        ) : (
          <div className="rounded-[3px] border border-dashed border-line-strong bg-surface p-14 text-center">
            <div className="font-brand text-[16px] font-bold text-ink">
              No models match those filters
            </div>
            <p className="mt-2 text-[13.5px] text-ink-2">
              The catalog is small and deliberately curated — try clearing a
              filter.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 h-[34px] cursor-pointer rounded-[2px] border border-line-strong bg-surface px-4 font-brand text-[13px] font-bold text-ink"
            >
              Clear all filters
            </button>
          </div>
        )}

        {inReview.length > 0 ? (
          <InReviewStrip pins={inReview} asOf={inReviewAsOf} />
        ) : null}

        {/* Review policy. */}
        <div className="mt-10 overflow-hidden rounded-md border border-line bg-surface text-ink">
          <div className="grid items-center gap-x-10 gap-y-7 px-5 sm:px-8 py-9 md:grid-cols-[auto_1fr_auto]">
            <div className="flex -space-x-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface-2"
                >
                  <SealIcon
                    className="h-5 w-5 text-verified"
                    knockout="var(--mp-surface-2)"
                  />
                </span>
              ))}
            </div>
            <div>
              <h3 className="mb-1.5 font-brand text-[20px] font-bold tracking-[-0.01em]">
                The review gate
              </h3>
              <p className="max-w-[70ch] text-[14px] leading-[1.65] text-ink-2">
                The marketplace is a git repository of model YAML files. Nothing
                appears here without a pull request and three maintainer
                approvals — the same gate applies to every new version pin, so a{" "}
                <code className="font-mono text-[13px] text-ink">stable</code>{" "}
                channel pointer is always a reviewed commit.
              </p>
            </div>
            <Link
              href="/contribute"
              className="inline-flex h-11 items-center rounded-[3px] border border-line-strong bg-surface px-6 font-brand text-[13.5px] font-bold text-ink transition-colors hover:bg-surface-2"
            >
              List your model
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
