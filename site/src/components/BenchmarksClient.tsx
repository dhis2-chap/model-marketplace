"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { BenchmarkRowView, BenchmarkSuiteView } from "@/lib/benchmarks";

/**
 * The benchmark suites, one table after another, each row opening its
 * run record in a centred modal so the full metric list stays out of the
 * page flow. Sorting and the open row are the only client state;
 * everything rendered comes from the build-time suite views.
 */

type SortKey = "ncrps" | "crps" | "mae" | "rmse" | "wall" | "mem";

const HEADERS: { key: SortKey | null; label: string }[] = [
  { key: null, label: "#" },
  { key: null, label: "Model · pin" },
  { key: "ncrps", label: "nCRPS" },
  { key: "crps", label: "CRPS" },
  { key: "mae", label: "MAE" },
  { key: "rmse", label: "RMSE" },
  { key: "wall", label: "Wall" },
  { key: "mem", label: "Peak mem" },
  { key: null, label: "Status" },
];

const GRID = "grid-cols-[36px_minmax(0,1.9fr)_repeat(6,minmax(0,1fr))_100px]";

/** Metrics already shown as headline figures at the top of the modal. */
const HEADLINE_IDS = new Set(["crps_norm", "crps", "mae", "rmse"]);

function fmt(v: number | null, digits: number): string {
  return v === null ? "—" : v.toFixed(digits);
}

function fmtMem(v: number | null): string {
  return v === null
    ? "—"
    : `${v.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} MB`;
}

function fmtSeconds(v: number | null): string {
  return v === null ? "—" : `${v.toFixed(2)} s`;
}

function Figure({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0 bg-surface px-4 py-3">
      <div className="truncate font-brand text-[10px] font-medium uppercase tracking-[0.09em] text-ink-3">
        {label}
      </div>
      <div
        className={`mt-1 truncate font-mono ${
          strong ? "text-[18px] font-medium text-ink" : "text-[16px] text-ink-2"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function RunRecord({ row }: { row: BenchmarkRowView }) {
  if (!row.measured) {
    return (
      <p className="max-w-[60ch] text-[14px] leading-[1.6] text-ink-2">
        The benchmarking server has no result for this pin on this suite yet. It
        benchmarks every listed model whose period type and covariates the
        dataset has, and the row fills in once it does.
      </p>
    );
  }
  const rest = row.metrics.filter((m) => !HEADLINE_IDS.has(m.id));
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-line bg-line sm:grid-cols-4">
        <Figure label="nCRPS" value={fmt(row.ncrps, 6)} strong />
        <Figure label="CRPS" value={fmt(row.crps, 4)} />
        <Figure label="MAE" value={fmt(row.mae, 4)} />
        <Figure label="RMSE" value={fmt(row.rmse, 4)} />
      </div>

      {rest.length > 0 ? (
        <section>
          <h3 className="mb-2 font-brand text-[13px] font-medium text-ink">
            All recorded metrics
          </h3>
          <dl className="grid gap-x-8 sm:grid-cols-2">
            {rest.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-t border-line py-2.5"
              >
                <dt className="text-[13px] text-ink">{m.label}</dt>
                <dd className="text-right font-mono text-[13px] text-ink">
                  {m.value}
                </dd>
                {m.description ? (
                  <dd className="col-span-2 mt-0.5 text-[11.5px] leading-[1.45] text-ink-3">
                    {m.description}
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {row.wall === null && row.cpu === null && row.mem === null ? null : (
        <section>
          <h3 className="mb-2 font-brand text-[13px] font-medium text-ink">
            Resources
          </h3>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[3px] border border-line bg-line">
            <Figure label="Wall time" value={fmtSeconds(row.wall)} />
            <Figure label="CPU time" value={fmtSeconds(row.cpu)} />
            <Figure label="Peak memory" value={fmtMem(row.mem)} />
          </div>
        </section>
      )}
    </div>
  );
}

function RunRecordModal({
  dialogRef,
  suite,
  rows,
  index,
  onStep,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  suite: BenchmarkSuiteView;
  rows: BenchmarkRowView[];
  index: number;
  onStep: (index: number) => void;
}) {
  const row = rows[index];
  if (!row) return <dialog ref={dialogRef} />;
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="run-record-title"
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && index > 0) onStep(index - 1);
        if (e.key === "ArrowRight" && index < rows.length - 1)
          onStep(index + 1);
      }}
      className="m-auto max-h-[calc(100dvh-48px)] w-[calc(100vw-32px)] max-w-[800px] overflow-hidden rounded-[3px] border-0 bg-surface p-0 text-ink shadow-lift backdrop:bg-[rgba(33,41,52,0.6)] open:flex open:flex-col"
    >
      <header className="flex items-start justify-between gap-4 border-b border-line px-6 pb-4 pt-5">
        <div className="min-w-0">
          <div className="font-brand text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
            {suite.heading} · {row.measured ? `rank ${index + 1}` : "no run"}
          </div>
          <h2
            id="run-record-title"
            className="mt-1.5 font-brand text-[20px] font-medium leading-tight text-ink"
          >
            {row.name}
          </h2>
          <div className="mt-1 truncate font-mono text-[12px] text-ink-3">
            {row.pinLine}
          </div>
        </div>
        <span
          className={`d2-tag shrink-0 ${
            row.measured ? "d2-tag-positive" : "d2-tag-neutral"
          }`}
        >
          {row.measured ? "Successful run" : "Not run"}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <RunRecord row={row} />
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2 px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="d2-button d2-button-small"
            disabled={index === 0}
            onClick={() => onStep(index - 1)}
            aria-label="Previous row"
          >
            ←
          </button>
          <span className="font-mono text-[12px] text-ink-3">
            {index + 1} / {rows.length}
          </span>
          <button
            type="button"
            className="d2-button d2-button-small"
            disabled={index === rows.length - 1}
            onClick={() => onStep(index + 1)}
            aria-label="Next row"
          >
            →
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/models/${row.modelId}`} className="d2-button">
            Model page
          </Link>
          <button
            type="button"
            className="d2-button d2-button-primary"
            data-autofocus
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
      </footer>
    </dialog>
  );
}

function SuiteTable({ suite }: { suite: BenchmarkSuiteView }) {
  const [sortKey, setSortKey] = useState<SortKey>("ncrps");
  const [openIndex, setOpenIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const measured = suite.rows.filter((r) => r.measured);
  const rows = [...measured]
    .sort((a, b) => (a[sortKey] ?? Infinity) - (b[sortKey] ?? Infinity))
    .concat(suite.rows.filter((r) => !r.measured));

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <dl className="flex flex-wrap gap-x-5 gap-y-1">
          {suite.runContext.map((c) => (
            <div key={c.k} className="flex items-baseline gap-1.5">
              <dt className="text-[12px] text-ink-3">{c.k}</dt>
              <dd className="font-mono text-[12px] text-ink">{c.v}</dd>
            </div>
          ))}
        </dl>
        <span className="whitespace-nowrap font-mono text-[11.5px] text-ink-3">
          {suite.countLine}
        </span>
      </div>

      <div className="overflow-x-auto rounded-[3px] border border-line bg-surface">
        <div className="min-w-[980px]">
          <div
            className={`grid ${GRID} gap-3 border-b border-line bg-surface-2 px-5 py-[11px]`}
          >
            {HEADERS.map((h) =>
              h.key ? (
                <button
                  key={h.label}
                  type="button"
                  onClick={() => setSortKey(h.key!)}
                  className={`cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border-0 bg-transparent p-0 text-right font-brand text-[10px] font-medium uppercase tracking-[0.09em] ${
                    sortKey === h.key ? "text-brand" : "text-ink-3"
                  }`}
                >
                  {h.label}
                  {sortKey === h.key ? " ↑" : ""}
                </button>
              ) : (
                <span
                  key={h.label}
                  className="overflow-hidden text-ellipsis whitespace-nowrap font-brand text-[10px] font-medium uppercase tracking-[0.09em] text-ink-3"
                >
                  {h.label}
                </span>
              ),
            )}
          </div>
          {rows.map((row, i) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                setOpenIndex(i);
                dialogRef.current?.showModal();
                // showModal focuses the first enabled control (an arrow);
                // start on Close instead.
                dialogRef.current
                  ?.querySelector<HTMLElement>("[data-autofocus]")
                  ?.focus();
              }}
              className={`grid w-full ${GRID} cursor-pointer items-center gap-3 border-b border-l-[3px] border-b-line border-l-transparent py-[13px] pl-[17px] pr-5 text-left last:border-b-0 hover:border-l-brand hover:bg-surface-2 ${
                row.measured ? "" : "opacity-[0.62]"
              }`}
            >
              <span className="font-mono text-[13px] text-ink-3">
                {row.measured ? i + 1 : "—"}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-brand text-[13.5px] font-medium text-ink">
                  {row.name}
                </span>
                <span className="mt-[3px] block truncate font-mono text-[11px] text-ink-3">
                  {row.pinLine}
                </span>
              </span>
              <span className="text-right font-mono text-[13.5px] text-ink">
                {fmt(row.ncrps, 6)}
              </span>
              <span className="text-right font-mono text-[13px] text-ink-2">
                {fmt(row.crps, 4)}
              </span>
              <span className="text-right font-mono text-[13px] text-ink-2">
                {fmt(row.mae, 4)}
              </span>
              <span className="text-right font-mono text-[13px] text-ink-2">
                {fmt(row.rmse, 4)}
              </span>
              <span className="text-right font-mono text-[13px] text-ink-2">
                {row.wall === null ? "—" : `${row.wall.toFixed(1)} s`}
              </span>
              <span className="text-right font-mono text-[13px] text-ink-2">
                {fmtMem(row.mem)}
              </span>
              <span
                className={`justify-self-start whitespace-nowrap rounded-[3px] border px-1.5 py-0.5 font-mono text-[10.5px] ${
                  row.measured
                    ? "border-verified bg-verified-tint text-verified"
                    : "border-line-strong text-ink-3"
                }`}
              >
                {row.measured ? "Successful" : "Not run"}
              </span>
            </button>
          ))}
          {suite.pendingNote ? (
            <div className="border-t border-line bg-surface-2 px-5 py-3 text-[12.5px] text-ink-2">
              {suite.pendingNote}
            </div>
          ) : null}
        </div>
      </div>

      <RunRecordModal
        dialogRef={dialogRef}
        suite={suite}
        rows={rows}
        index={openIndex}
        onStep={setOpenIndex}
      />
    </>
  );
}

export function BenchmarkSuites({ suites }: { suites: BenchmarkSuiteView[] }) {
  if (suites.length === 0) return null;
  return (
    <>
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-9">
        <p className="text-[13px] text-ink-2">
          Click a column to sort, a row to open its run record. MAE, RMSE and
          CRPS are in cases and only comparable within one suite; normalised
          CRPS is the cross-dataset figure.
        </p>
      </section>
      {suites.map((suite) => (
        <section
          key={suite.dataset}
          className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-8"
        >
          <h2 className="mb-2 font-brand text-[22px] font-medium text-ink">
            {suite.heading}
          </h2>
          <SuiteTable suite={suite} />
        </section>
      ))}
    </>
  );
}
