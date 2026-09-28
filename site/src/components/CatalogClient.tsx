"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { InReviewPinView, ModelCardView } from "@/lib/views";
import {
  ASSESSED_STATUS_COPY,
  ASSESSED_STATUS_ORDER,
} from "@/lib/presentation";
import { AssessedStatusBadge, KindBadge } from "./badges";
import { Avatar, AuthorLine } from "./author";
import { MagnifierIcon } from "./icons";

type Kind = ModelCardView["kind"];
type Filters = Partial<Record<"period" | "cov" | "lang" | "geo", string>>;

const CHIPS: { label: string; key: keyof Filters; val: string }[] = [
  { label: "Monthly", key: "period", val: "monthly" },
  { label: "Climate-driven", key: "cov", val: "climate" },
  { label: "No covariates", key: "cov", val: "none" },
  { label: "Needs geometry", key: "geo", val: "yes" },
  { label: "Python", key: "lang", val: "Python" },
  { label: "R", key: "lang", val: "R" },
];

function matches(m: ModelCardView, q: string, filters: Filters): boolean {
  if (q) {
    const hay =
      `${m.name} ${m.summary} ${m.framework} ${m.repo} ${m.covLabel} ${m.author} ${m.organization ?? ""}`.toLowerCase();
    if (!hay.includes(q.toLowerCase())) return false;
  }
  if (filters.period && !m.periodType.includes(filters.period)) return false;
  if (filters.cov === "climate" && !["climate", "both"].includes(m.covMode))
    return false;
  if (filters.cov === "none" && !["none", "both"].includes(m.covMode))
    return false;
  if (filters.geo === "yes" && !m.requiresGeo) return false;
  if (filters.lang && m.language !== filters.lang) return false;
  return true;
}

/**
 * One listing: what it is, who made it, and the authors' own status. The
 * status badge is the authors' claim; the review gate is stated once above
 * the grid, since every listed pin carries it.
 */
function ModelCard({ m }: { m: ModelCardView }) {
  return (
    <Link
      href={`/models/${m.id}`}
      className={`flex min-w-0 flex-col gap-4 rounded-md bg-surface p-5 transition-colors hover:border-brand ${
        m.kind === "template"
          ? "border border-dashed border-line-strong"
          : "border border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-brand text-[20px] font-bold leading-tight text-ink">
          {m.name}
        </h3>
        <AssessedStatusBadge status={m.assessedStatus} />
      </div>
      <p className="line-clamp-3 text-[15px] leading-[1.55] text-ink-2">
        {m.summary}
      </p>
      <div className="mt-auto flex flex-wrap gap-1.5">
        <KindBadge kind={m.kind} />
        {[m.framework, m.periodType, m.covLabel].filter((t) => t !== "—").map((tag) => (
          <span
            key={tag}
            className="rounded-[2px] bg-surface-3 px-2 py-0.5 text-[13px] text-ink-2"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="border-t border-line pt-4">
        <AuthorLine
          author={m.author}
          organization={m.organization}
          maintainers={m.maintainers}
        />
      </div>
    </Link>
  );
}

/** Open pull requests: new models and new versions awaiting approval. */
function InReview({ pins }: { pins: InReviewPinView[] }) {
  return (
    <section className="mt-14">
      <h2 className="mb-4 font-brand text-[20px] font-bold text-ink">
        In review
      </h2>
      <ul className="divide-y divide-line overflow-hidden rounded-md border border-dashed border-exp bg-surface">
        {pins.map((pin) => (
          <li key={`${pin.prNumber}-${pin.modelId}-${pin.label}`}>
            <a
              href={pin.prUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-surface-2"
            >
              <Avatar handle={pin.author} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">
                  {pin.catalogLabel}
                  {pin.isNewModel ? (
                    <span className="ml-2 text-[13px] font-bold text-exp">
                      New model
                    </span>
                  ) : null}
                </span>
                <span className="block text-[14px] text-ink-2">
                  Submitted by @{pin.author} · #{pin.prNumber}
                </span>
              </span>
              <span className="text-[14px] font-bold text-exp">
                {pin.approvals} approvals
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CatalogClient({
  models,
  inReview,
}: {
  models: ModelCardView[];
  inReview: InReviewPinView[];
}) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [kind, setKind] = useState<Kind>("model");
  const [q, setQ] = useState(urlQuery);
  const [filters, setFilters] = useState<Filters>({});
  // Adopt a new header-search query mid-session (state adjusted during render).
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setQ(urlQuery);
  }

  const count = (k: Kind) => models.filter((m) => m.kind === k).length;
  const visible = models.filter(
    (m) => m.kind === kind && matches(m, q, filters),
  );
  const toggleChip = (key: keyof Filters, val: string) =>
    setFilters((f) => ({ ...f, [key]: f[key] === val ? undefined : val }));
  const clearAll = () => {
    setFilters({});
    setQ("");
  };

  const KINDS: { id: Kind; label: string }[] = [
    { id: "model", label: "Models" },
    { id: "template", label: "Templates" },
  ];

  return (
    <main className="mx-auto max-w-[1240px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <h1 className="max-w-[20ch] font-brand text-[clamp(32px,4vw,46px)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
        Forecasting models for CHAP
      </h1>
      <p className="mt-3 max-w-[52ch] text-[17px] leading-[1.6] text-ink-2">
        Every model here is approved by three CHAP maintainers before it is
        listed.
      </p>

      <div className="relative mt-8 max-w-[560px]">
        <MagnifierIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-3" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, method or author"
          aria-label="Search models"
          className="h-12 w-full rounded-md border border-line-strong bg-surface pl-11 pr-4 text-[16px] text-ink placeholder:text-ink-3 focus:border-brand"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            aria-pressed={kind === k.id}
            className={`h-10 cursor-pointer rounded-md border px-4 text-[15px] font-bold ${
              kind === k.id
                ? "border-ink bg-ink text-surface"
                : "border-line-strong bg-surface text-ink-2 hover:text-ink"
            }`}
          >
            {k.label} <span className="font-normal opacity-75">{count(k.id)}</span>
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-line-strong sm:block" aria-hidden />
        {CHIPS.map((chip) => {
          const active = filters[chip.key] === chip.val;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => toggleChip(chip.key, chip.val)}
              aria-pressed={active}
              className={`h-9 cursor-pointer rounded-full border px-3.5 text-[14px] ${
                active
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-line bg-surface text-ink-2 hover:border-line-strong"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {kind === "template" ? (
        <p className="mt-4 text-[15px] text-ink-2">
          Templates are starting points for writing a model — not for making
          forecasts.
        </p>
      ) : null}

      {visible.length > 0 ? (
        <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))]">
          {visible.map((m) => (
            <ModelCard key={m.id} m={m} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-[16px] font-bold text-ink">No matches</p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 h-10 cursor-pointer rounded-md border border-line-strong bg-surface px-4 text-[15px] font-bold text-ink"
          >
            Clear filters
          </button>
        </div>
      )}

      <details className="mt-8 max-w-[760px] text-[15px] text-ink-2">
        <summary className="cursor-pointer font-bold text-brand">
          What does the coloured status mean?
        </summary>
        <p className="mt-3">
          It is the authors&apos; own rating of their model — not a
          marketplace grade.
        </p>
        <dl className="mt-3 space-y-2">
          {ASSESSED_STATUS_ORDER.map((status) => (
            <div key={status} className="flex flex-wrap items-center gap-3">
              <dt>
                <AssessedStatusBadge status={status} />
              </dt>
              <dd>{ASSESSED_STATUS_COPY[status].blurb}</dd>
            </div>
          ))}
        </dl>
      </details>

      {inReview.length > 0 ? <InReview pins={inReview} /> : null}

      <section className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-md border border-line bg-surface p-6 sm:p-8">
        <div>
          <h2 className="font-brand text-[20px] font-bold text-ink">
            Built a model?
          </h2>
          <p className="mt-1 text-[15px] text-ink-2">
            List it with one pull request. Your name goes on it.
          </p>
        </div>
        <Link
          href="/contribute"
          className="inline-flex h-11 items-center rounded-md bg-brand px-6 text-[15px] font-bold text-white hover:bg-brand-dark"
        >
          Submit a model
        </Link>
      </section>
    </main>
  );
}
