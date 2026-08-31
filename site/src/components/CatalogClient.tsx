"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import type { ModelCardView } from "@/lib/views";
import { MaturityBadge, VerifiedInline } from "./badges";
import { PinChip } from "./copy";
import { MagnifierIcon } from "./icons";
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

function ModelCard({ m }: { m: ModelCardView }) {
  return (
    <Link
      href={`/models/${m.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[box-shadow,border-color,transform] duration-[180ms] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3 px-[18px] pt-[18px]">
        <div className="min-w-0">
          <h3 className="mb-[5px] font-brand text-[17px] font-medium tracking-[-0.01em] text-ink">
            {m.name}
          </h3>
          <div className="truncate font-mono text-[11px] text-ink-3">{m.repo}</div>
        </div>
        <MaturityBadge maturity={m.maturity} />
      </div>
      <div className="px-[18px] pt-3.5">
        <VerifiedInline approvals={m.approvals} detail={m.framework} />
      </div>
      <p className="flex-1 px-[18px] pt-3 text-[13.5px] leading-[1.55] text-ink-2 [text-wrap:pretty]">
        {m.summary}
      </p>
      <div className="flex flex-wrap gap-1.5 px-[18px] pt-3.5">
        {[m.periodType, m.covLabel, m.horizon ? `horizon ${m.horizon}` : null]
          .filter(Boolean)
          .map((tag) => (
            <span
              key={tag}
              className="rounded-[3px] bg-surface-3 px-[7px] py-[3px] text-[11px] text-ink-2"
            >
              {tag}
            </span>
          ))}
      </div>
      {m.spark.length > 0 ? (
        <div className="px-[18px] pt-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="font-brand text-[9.5px] font-medium uppercase tracking-[0.1em] text-ink-3">
              CRPS · illustrative
            </span>
            <span className="font-mono text-[11px] text-ink-2">
              {m.spark[m.spark.length - 1].toFixed(2)}
            </span>
          </div>
          <Sparkline values={m.spark} />
        </div>
      ) : null}
      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-[18px] py-3">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 font-brand text-[9.5px] font-medium uppercase tracking-[0.06em] text-verified">
            {m.stableTag}
          </span>
          <PinChip display={m.stablePinDisplay} copyText={m.stablePinFull} />
        </span>
        <span className="shrink-0 font-brand text-[12px] font-medium text-brand">
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

export function CatalogClient({
  models,
  stats,
  heroChart,
}: {
  models: ModelCardView[];
  stats: MarketplaceStatsView;
  heroChart: ReactNode;
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

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-surface-2 to-surface">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-8 pb-13 pt-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="mb-[18px] flex items-center gap-2.5">
              <span className="rounded-full bg-verified-tint px-2.5 py-[5px] font-brand text-[10px] font-medium uppercase tracking-[0.12em] text-verified">
                Curated · review-gated
              </span>
              <span className="font-mono text-[11px] text-ink-3">
                git-backed catalog
              </span>
            </div>
            <h1 className="mb-[18px] font-brand text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-ink [text-wrap:balance] md:text-[52px]">
              Verified forecasting models for climate &amp; health
            </h1>
            <p className="mb-7 max-w-[52ch] text-[17px] leading-relaxed text-ink-2">
              Every model and every version pin in the CHAP marketplace is
              reviewed and approved by three maintainers before it is listed.
              Pin a commit, run it in your CHAP instance, reproduce the result.
            </p>
            <div className="relative mb-9 max-w-[520px]">
              <MagnifierIcon className="pointer-events-none absolute left-4 top-4 h-[18px] w-[18px] text-ink-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${stats.models} verified models — try “INLA” or “no covariates”`}
                className="h-13 w-full rounded-md border border-line-strong bg-surface pl-11 pr-4 text-[15px] text-ink shadow-mp outline-none placeholder:text-ink-3 focus:border-brand focus:[box-shadow:0_0_0_3px_var(--mp-brand-tint)]"
              />
            </div>
            <div className="flex items-center gap-10">
              {(
                [
                  [stats.models, "Models listed", "text-ink"],
                  [stats.verifiedPins, "Verified version pins", "text-ink"],
                  [stats.reviews, "Maintainer reviews", "text-verified"],
                ] as const
              ).map(([n, label, tone], i) => (
                <div key={label} className={i > 0 ? "border-l border-line pl-10" : ""}>
                  <div className={`font-brand text-[32px] font-medium leading-none tracking-[-0.02em] ${tone}`}>
                    {n}
                  </div>
                  <div className="mt-2 font-brand text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-3">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">{heroChart}</div>
        </div>
      </section>

      {/* Toolbar + grid */}
      <section className="mx-auto max-w-[1240px] px-8 pb-20 pt-9">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-6 border-b border-line">
          <div className="flex gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSet(tab.id)}
                className="relative flex cursor-pointer items-center gap-2 bg-transparent px-4 pb-3.5 pt-2.5 font-brand text-[14px] font-medium text-ink"
              >
                {tab.label}
                <span className="font-mono text-[11px] font-normal text-ink-3">
                  {counts[tab.id]}
                </span>
                {set === tab.id ? (
                  <span className={`absolute inset-x-0 -bottom-px h-0.5 ${tab.bar}`} />
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-2.5">
            <span className="font-brand text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
              Filter
            </span>
            {CHIPS.map((chip) => {
              const active = filters[chip.key] === chip.val;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => toggleChip(chip.key, chip.val)}
                  className={`h-7 cursor-pointer rounded-[3px] border px-[11px] font-brand text-[12px] font-medium transition-colors ${
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
                className="h-7 cursor-pointer bg-transparent px-2.5 font-brand text-[12px] font-medium text-brand"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <p className="mb-[18px] text-[12.5px] text-ink-3">
          {visible.length} {visible.length === 1 ? "model" : "models"} · every
          pin below carries three maintainer approvals
        </p>

        {visible.length > 0 ? (
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {visible.map((m) => (
              <ModelCard key={m.id} m={m} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line-strong p-14 text-center">
            <div className="font-brand text-[16px] text-ink">
              No models match those filters
            </div>
            <p className="mt-2 text-[13px] text-ink-2">
              The catalog is small and deliberately curated — try clearing a
              filter.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 h-[34px] cursor-pointer rounded-[4px] border border-line-strong bg-surface px-4 font-brand text-[13px] font-medium text-ink"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Review gate CTA */}
        <div className="mt-10 grid items-center gap-7 rounded-lg border border-line bg-surface-2 px-7 py-[26px] md:grid-cols-[1fr_auto]">
          <div>
            <h3 className="mb-2 font-brand text-[18px] font-medium text-ink">
              The review gate
            </h3>
            <p className="max-w-[74ch] text-[13.5px] leading-relaxed text-ink-2">
              The marketplace is a git repository of model YAML files. Nothing
              appears here without a pull request and three maintainer
              approvals — the same gate applies to every new version pin, so a{" "}
              <code className="font-mono text-[12.5px] text-ink">stable</code>{" "}
              channel pointer is always a reviewed commit.
            </p>
          </div>
          <Link
            href="/contribute"
            className="inline-flex h-10 items-center rounded-[4px] bg-brand px-5 font-brand text-[13.5px] font-medium text-white transition-colors hover:bg-brand-dark"
          >
            List your model
          </Link>
        </div>
      </section>
    </>
  );
}
