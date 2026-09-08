"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import type { InReviewPinView, ModelCardView } from "@/lib/views";
import {
  ASSESSED_STATUS_COPY,
  ASSESSED_STATUS_ORDER,
} from "@/lib/presentation";
import type { AssessedStatus } from "@/lib/schema";
import { AssessedStatusBadge, KindBadge, VerifiedInline } from "./badges";
import { PinChip } from "./copy";
import { MagnifierIcon, SealIcon } from "./icons";

type SetFilter = "all" | "model" | "template";
type Filters = Partial<Record<"period" | "cov" | "lang" | "geo", string>>;

const CHIPS: { label: string; key: keyof Filters; val: string }[] = [
  { label: "monthly", key: "period", val: "monthly" },
  { label: "climate-driven", key: "cov", val: "climate" },
  { label: "no covariates", key: "cov", val: "none" },
  { label: "needs geometry", key: "geo", val: "yes" },
  { label: "Python", key: "lang", val: "Python" },
  { label: "R", key: "lang", val: "R" },
];

function matches(
  m: ModelCardView,
  q: string,
  filters: Filters,
  statuses: Set<AssessedStatus>,
): boolean {
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
  if (filters.geo === "yes" && !m.requiresGeo) return false;
  if (filters.lang && m.language !== filters.lang) return false;
  if (statuses.size > 0 && !statuses.has(m.assessedStatus)) return false;
  return true;
}

/**
 * A restrained catalog entry. Two independent signals ride the header: what
 * the marketplace verified (the pin) and what the author will vouch for (the
 * assessed status). They are deliberately not merged into one badge.
 */
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
        <KindBadge kind={m.kind} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-[18px] pt-3.5">
        <VerifiedInline approvals={m.approvals} detail={m.framework} />
      </div>
      <div className="px-[18px] pt-2.5">
        <AssessedStatusBadge status={m.assessedStatus} />
      </div>
      <p className="flex-1 px-[18px] pt-3 text-[13.5px] leading-[1.6] text-ink-2 [text-wrap:pretty]">
        {m.summary}
      </p>
      <div className="flex flex-wrap gap-1.5 px-[18px] pt-4">
        {[
          m.periodType,
          m.covLabel,
          m.horizon,
          m.requiresGeo ? "needs geometry" : null,
        ]
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
  templates: number;
  verifiedPins: number;
  reviews: number;
}

/**
 * The AssessedStatus scale, spelled out. Without it the coloured badges read
 * as a marketplace grade, which is exactly what they are not.
 */
function AssessedStatusLegend({
  present,
}: {
  present: AssessedStatus[];
}) {
  return (
    <div className="mt-10 overflow-hidden rounded-md border border-line bg-surface">
      <div className="border-b border-line bg-surface-2 px-5 py-3">
        <span className="font-brand text-[13px] font-bold text-ink">
          Author-assessed status
        </span>
        <p className="mt-1 max-w-[92ch] text-[12.5px] leading-[1.6] text-ink-2">
          Each model service declares how far its own authors have validated
          it — chapkit&apos;s <code className="font-mono text-[12px] text-ink">AssessedStatus</code>,
          shown here verbatim. It is separate from the marketplace review
          gate: three maintainer approvals mean a pin is what it claims to be
          and runs as a chapkit service, never that its forecasts are good. No
          model in the catalog is self-assessed{" "}
          <strong className="font-bold text-ink">green</strong> yet.
        </p>
      </div>
      <dl className="divide-y divide-line">
        {ASSESSED_STATUS_ORDER.map((status) => (
          <div
            key={status}
            className={`grid items-baseline gap-x-4 gap-y-1 px-5 py-2.5 sm:grid-cols-[168px_1fr] ${
              present.includes(status) ? "" : "opacity-55"
            }`}
          >
            <dt>
              <AssessedStatusBadge status={status} />
            </dt>
            <dd className="text-[12.5px] leading-[1.55] text-ink-2">
              {ASSESSED_STATUS_COPY[status].blurb}
              {present.includes(status) ? null : (
                <span className="ml-1.5 font-mono text-[11px] text-ink-3">
                  — none listed
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
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
  const [statuses, setStatuses] = useState<Set<AssessedStatus>>(new Set());
  // Adopt a new header-search query mid-session (state adjusted during render).
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setQ(urlQuery);
  }

  const counts = useMemo(
    () => ({
      all: models.length,
      model: models.filter((m) => m.kind === "model").length,
      template: models.filter((m) => m.kind === "template").length,
    }),
    [models],
  );

  const presentStatuses = useMemo(
    () =>
      ASSESSED_STATUS_ORDER.filter((s) =>
        models.some((m) => m.assessedStatus === s),
      ),
    [models],
  );

  const visible = models.filter(
    (m) => (set === "all" || m.kind === set) && matches(m, q, filters, statuses),
  );
  const anyFilter =
    q !== "" || Object.values(filters).some(Boolean) || statuses.size > 0;

  const toggleChip = (key: keyof Filters, val: string) =>
    setFilters((f) => ({ ...f, [key]: f[key] === val ? undefined : val }));
  const toggleStatus = (status: AssessedStatus) =>
    setStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  const clearAll = () => {
    setFilters({});
    setStatuses(new Set());
    setQ("");
  };

  const TABS: { id: SetFilter; label: string; bar: string }[] = [
    { id: "all", label: "Everything", bar: "bg-ink" },
    { id: "model", label: "Models", bar: "bg-verified" },
    { id: "template", label: "Templates", bar: "bg-exp" },
  ];

  const STATS = [
    [stats.models, "Forecasting models", "text-ink"],
    [stats.templates, "Author templates", "text-ink"],
    [stats.verifiedPins, "Verified version pins", "text-ink"],
    [stats.reviews, "Maintainer reviews", "text-ink"],
  ] as const;

  return (
    <>
      {/* Introduction and a compact forecast illustration. */}
      <section className="relative overflow-hidden border-b border-line bg-surface text-ink">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid items-end gap-x-14 gap-y-4 pt-10 sm:pt-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="pb-9 sm:pb-10">
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                <span className="text-brand">Review-gated registry</span>
                <span className="text-ink-2">git-backed · chapkit services</span>
              </div>
              <h1 className="mb-6 max-w-[15ch] font-brand text-[clamp(34px,4vw,50px)] font-semibold leading-[1.1] tracking-[-0.03em] [text-wrap:balance]">
                Verified forecasting models for climate &amp; health
              </h1>
              <p className="mb-9 max-w-[46ch] text-[15px] leading-[1.7] text-ink-2">
                Every model here is a chapkit service, pinned to a commit and
                a published image, and approved by three maintainers before it
                is listed. What each model&apos;s own authors will vouch for is
                shown separately, in their words.
              </p>
              <div className="relative max-w-[520px]">
                <MagnifierIcon className="pointer-events-none absolute left-4 top-4 h-[18px] w-[18px] text-ink-3" />
                {/* 16px on phones — anything smaller and iOS Safari zooms
                    the page in when the field takes focus. */}
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Search ${counts.all} listings — try “INLA” or “no covariates”`}
                  aria-label="Search models"
                  className="h-13 w-full rounded-md border border-line-strong bg-paper pl-11 pr-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-brand sm:text-[14px]"
                />
              </div>
            </div>
            <div className="hidden self-end pb-9 lg:block">{heroChart}</div>
          </div>
        </div>
        {/* Registry totals. */}
        <div className="relative border-t border-line">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-4 px-5 sm:flex sm:items-stretch sm:gap-x-0 sm:px-8">
            {STATS.map(([n, label, tone], i) => (
              <div
                key={label}
                className={`flex flex-col justify-start py-5 sm:justify-center sm:pr-10 ${
                  i > 0 ? "sm:border-l sm:border-line sm:pl-10" : ""
                }`}
              >
                <div
                  className={`font-brand text-[21px] font-semibold leading-none tracking-[-0.02em] sm:text-[24px] ${tone}`}
                >
                  {n}
                </div>
                <div className="mt-2 text-[11px] leading-[1.35] text-ink-2 sm:text-[12px]">
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
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line-strong">
          <div className="no-scrollbar flex max-w-full gap-0.5 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSet(tab.id)}
                className={`relative flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap bg-transparent px-3 pb-3.5 pt-2.5 font-brand text-[13px] font-medium sm:px-4 ${
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

        {/* Author-assessed status filter — its own row, because it means
            something different from the filters above. */}
        <div className="mb-[18px] flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            Author-assessed
          </span>
          {presentStatuses.map((status) => {
            const active = statuses.has(status);
            const copy = ASSESSED_STATUS_COPY[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatus(status)}
                title={copy.blurb}
                aria-pressed={active}
                className={`h-7 cursor-pointer rounded-[2px] border px-[11px] font-mono text-[11.5px] transition-colors ${
                  active
                    ? "border-brand bg-brand-tint text-brand"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong"
                }`}
              >
                {copy.label}
                <span className="ml-1.5 text-ink-3">
                  {models.filter((m) => m.assessedStatus === status).length}
                </span>
              </button>
            );
          })}
          <a
            href="#assessed-status"
            className="font-brand text-[12px] font-bold text-brand hover:underline"
          >
            What do these mean?
          </a>
        </div>

        <p className="mb-[18px] font-mono text-[11.5px] text-ink-3">
          {visible.length} {visible.length === 1 ? "listing" : "listings"} ·
          every pin below carries three maintainer approvals
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

        <div id="assessed-status" className="scroll-mt-24">
          <AssessedStatusLegend present={presentStatuses} />
        </div>

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
