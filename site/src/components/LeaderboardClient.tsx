"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  LeaderboardRowView,
  LeaderboardSuiteView,
} from "@/lib/benchmarks";
import { useCopy } from "./copy";

/**
 * One suite of the leaderboard: the sortable run table and the run-record
 * panel below it. Sorting and row selection are the only client state;
 * everything rendered comes from the build-time suite view.
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

const CAVEATS = [
  {
    h: "One split, one dataset.",
    b: "A single backtest split gives a point estimate with no spread — this cannot separate two close models yet.",
  },
  {
    h: "MAE, RMSE and CRPS are in cases.",
    b: "They scale with incidence, so they are meaningless across datasets. Normalised CRPS is the one to carry between suites.",
  },
  {
    h: "Runtime and memory are machine figures.",
    b: "Wall time, CPU time and peak memory were recorded on one machine, unnormalised — treat them as an order of magnitude.",
  },
  {
    h: "The pin is the subject.",
    b: "A score belongs to a commit, not to a model name. Re-running a different commit produces a new row, never an update to this one.",
  },
];

const ROADMAP = [
  "Multiple backtest splits per run, reported as median and spread rather than one number.",
  "Fixed seeds and container digests recorded with every run, so a score can be re-derived exactly.",
  "A recorded hardware profile, so runtime and memory become comparable between contributors.",
  "Multi-dataset suites — Brazil, Vietnam and Laos — with normalised CRPS as the cross-suite score.",
  "Machine-readable run artefacts published per pin, which is what this table will read from.",
];

const GRID = "grid-cols-[36px_minmax(0,1.9fr)_repeat(6,minmax(0,1fr))_100px]";

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

function CommandBlock({ cmd }: { cmd: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="flex items-stretch gap-2">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre rounded-[4px] border border-line bg-surface-2 px-[11px] py-[9px] font-mono text-[12px] leading-normal text-ink">
        {cmd}
      </code>
      <button
        type="button"
        onClick={() => copy(cmd)}
        className="shrink-0 cursor-pointer rounded-[4px] border border-line-strong bg-surface px-3.5 font-brand text-[12.5px] font-medium text-ink transition-colors hover:border-brand hover:text-brand"
      >
        {copied === cmd ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function RunRecord({ row }: { row: LeaderboardRowView }) {
  const metrics = row.measured
    ? [
        { k: "MAE", note: "cases", v: fmt(row.mae, 4) },
        { k: "RMSE", note: "cases", v: fmt(row.rmse, 4) },
        { k: "CRPS", note: "cases", v: fmt(row.crps, 4) },
        {
          k: "Normalised CRPS",
          note: "comparable across datasets",
          v: fmt(row.ncrps, 6),
          strong: true,
        },
        { k: "Wall time", v: row.wall === null ? "—" : `${row.wall.toFixed(2)} s` },
        { k: "CPU time", v: row.cpu === null ? "—" : `${row.cpu.toFixed(2)} s` },
        { k: "Peak memory", v: fmtMem(row.mem) },
        { k: "Status", v: "Successful", status: true },
      ]
    : [];
  return (
    <div className="overflow-hidden rounded-lg border border-line-strong bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <Link
            href={`/models/${row.modelId}`}
            className="font-brand text-[15px] font-medium text-ink hover:text-brand"
          >
            {row.name}
          </Link>
          <div className="mt-1 truncate font-mono text-[11.5px] text-ink-3">
            {row.suiteLine}
          </div>
        </div>
        <span
          className={`shrink-0 whitespace-nowrap rounded-[3px] border px-2 py-1 font-brand text-[9.5px] font-medium uppercase tracking-[0.08em] ${
            row.measured
              ? "border-verified text-verified"
              : "border-line-strong text-ink-3"
          }`}
        >
          {row.measured ? "run record" : "no run"}
        </span>
      </div>
      {row.measured ? (
        <div>
          {metrics.map((m) => (
            <div
              key={m.k}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-line px-5 py-[11px]"
            >
              <span className="text-[13px] text-ink-2">
                {m.k}
                {m.note ? <span className="text-ink-3"> {m.note}</span> : null}
              </span>
              <span
                className={`text-right font-mono ${
                  m.status
                    ? "text-[13.5px] text-verified"
                    : m.strong
                      ? "text-[14.5px] font-medium text-ink"
                      : "text-[13.5px] text-ink-2"
                }`}
              >
                {m.v}
              </span>
            </div>
          ))}
          <div className="px-5 pb-[18px] pt-3.5">
            <div className="mb-2 font-brand text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
              Reproduce
            </div>
            <CommandBlock cmd={row.cmd} />
          </div>
        </div>
      ) : (
        <div className="p-5">
          <p className="mb-4 text-[13.5px] leading-[1.6] text-ink-2">
            No{" "}
            <code className="font-mono text-[12.5px] text-ink">chap eval</code>{" "}
            run has been recorded for this pin on this suite. Run it and the
            row fills in — same dataset, horizon, splits and sample count as
            the measured rows, so the numbers stay comparable.
          </p>
          <CommandBlock cmd={row.cmd} />
        </div>
      )}
    </div>
  );
}

export function LeaderboardSuite({ suite }: { suite: LeaderboardSuiteView }) {
  const [sortKey, setSortKey] = useState<SortKey>("ncrps");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const measured = suite.rows.filter((r) => r.measured);
  const rows = [...measured]
    .sort(
      (a, b) => (a[sortKey] ?? Infinity) - (b[sortKey] ?? Infinity),
    )
    .concat(suite.rows.filter((r) => !r.measured));
  const selected =
    rows.find((r) => r.id === selectedId) ?? measured[0] ?? rows[0];

  return (
    <>
      <section className="mx-auto max-w-[1240px] px-8 pt-9">
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h2 className="mb-1.5 font-brand text-[20px] font-medium text-ink">
              {suite.heading}
            </h2>
            <p className="text-[13px] text-ink-2">
              Click a column to sort, a row to open its run record. MAE, RMSE
              and CRPS are in cases and only comparable within this dataset;
              normalised CRPS is the cross-dataset figure.
            </p>
          </div>
          <span className="whitespace-nowrap font-mono text-[11.5px] text-ink-3">
            {suite.countLine}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
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
                onClick={() => setSelectedId(row.id)}
                className={`grid w-full ${GRID} cursor-pointer items-center gap-3 border-b border-l-[3px] border-b-line py-[13px] pl-[17px] pr-5 text-left last:border-b-0 ${
                  selected.id === row.id
                    ? "border-l-brand bg-surface-2"
                    : "border-l-transparent"
                } ${row.measured ? "" : "opacity-[0.62]"}`}
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
      </section>

      <section className="mx-auto max-w-[1240px] px-8 pt-8">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <RunRecord row={selected} />
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-line bg-surface-2 p-5">
              <div className="mb-3 font-brand text-[15px] font-medium text-ink">
                How to read these numbers
              </div>
              <div className="flex flex-col gap-2.5">
                {CAVEATS.map((c) => (
                  <div
                    key={c.h}
                    className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5 text-[13px] leading-[1.55] text-ink-2"
                  >
                    <span className="text-exp">•</span>
                    <span>
                      <span className="font-bold text-ink">{c.h}</span> {c.b}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-surface p-5">
              <div className="mb-3 font-brand text-[15px] font-medium text-ink">
                Next:{" "}
                <span className="font-mono text-[13.5px]">
                  chap-cli benchmark
                </span>
              </div>
              <p className="mb-3.5 text-[13px] leading-[1.6] text-ink-2">
                The gap between &ldquo;a run happened on someone&apos;s
                laptop&rdquo; and &ldquo;a reproducible benchmark&rdquo; is
                what the CLI closes. Planned, in order:
              </p>
              <div className="flex flex-col gap-[9px]">
                {ROADMAP.map((step, i) => (
                  <div
                    key={step}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-2.5 text-[13px] leading-[1.55] text-ink-2"
                  >
                    <span className="font-mono text-[11px] text-ink-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
