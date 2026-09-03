import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import {
  getRegistry,
  shortCommit,
  stableVersion,
  versionByTag,
  type Registry,
} from "./registry";
import { datasetNameFor } from "./presentation";
import { benchmarkSchema, type Benchmark } from "./schema";

/**
 * Build-time loader for the benchmark store at <repo>/benchmarks — real
 * evaluation output, one file per (model, version, dataset). Like the
 * registry, any violation throws and fails the build: the path encodes the
 * triple and must agree with the file content, and model/version/commit must
 * resolve against the registry.
 */

const FILE_PATTERN = /^benchmarks\/([a-z0-9_]+)\/([^/]+)\/([a-z0-9-]+)\.yaml$/;

export function loadBenchmarks(
  registry: Registry,
  root: string,
): Benchmark[] {
  const dir = path.join(root, "benchmarks");
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => path.join("benchmarks", f))
    .sort();

  const byId = new Map(registry.models.map((m) => [m.id, m]));
  return files.map((relPath) => {
    const match = relPath.match(FILE_PATTERN);
    if (!match) {
      throw new Error(
        `${relPath}: benchmark files must be benchmarks/<model_id>/<version>/<dataset>.yaml`,
      );
    }
    const [, modelId, versionTag, dataset] = match;

    const parsed = benchmarkSchema.safeParse(
      parse(fs.readFileSync(path.join(root, relPath), "utf8")),
    );
    if (!parsed.success) {
      throw new Error(`${relPath} is invalid:\n${parsed.error.message}`);
    }
    const bench = parsed.data;

    for (const [field, fromPath] of [
      ["model", modelId],
      ["version", versionTag],
      ["dataset", dataset],
    ] as const) {
      if (bench[field] !== fromPath) {
        throw new Error(
          `${relPath}: ${field} "${bench[field]}" does not match the file path`,
        );
      }
    }
    const model = byId.get(bench.model);
    if (!model) {
      throw new Error(`${relPath}: model "${bench.model}" is not in the registry`);
    }
    const version = versionByTag(model, bench.version);
    if (!version) {
      throw new Error(
        `${relPath}: version "${bench.version}" is not in models/${bench.model}.yaml`,
      );
    }
    if (version.commit !== bench.commit) {
      throw new Error(
        `${relPath}: commit does not match the pin for ${bench.model}@${bench.version} (${version.commit})`,
      );
    }
    const config = bench.run?.configuration;
    if (config && !(config in model.configurations)) {
      throw new Error(
        `${relPath}: configuration "${config}" is not in models/${bench.model}.yaml`,
      );
    }
    return bench;
  });
}

let cached: Benchmark[] | null = null;

/** Benchmarks for the registry the site is building, loaded once. */
export function getBenchmarks(): Benchmark[] {
  cached ??= loadBenchmarks(getRegistry(), getRegistry().root);
  return cached;
}

export function benchmarksFor(
  records: Benchmark[],
  modelId: string,
): Benchmark[] {
  return records.filter((b) => b.model === modelId);
}

/** Derived, never stored: skill vs. the stored baseline, when present. */
export function skillOf(bench: Benchmark): number | null {
  const { crps, baseline_crps } = bench.metrics;
  return baseline_crps ? 1 - crps / baseline_crps : null;
}

/* ---------- benchmark comparisons: recorded runs, one suite per dataset ---------- */

/**
 * Serializable benchmark views. A suite is a dataset every row shares; a
 * row is either a recorded run or a listed pin with no run yet — the page
 * never interpolates a score for the latter.
 */
export interface BenchmarkRowView {
  /** Selection key: "<model>@<version>". */
  id: string;
  modelId: string;
  name: string;
  versionTag: string;
  /** "mstl_arima@6cdec6f · v1" */
  pinLine: string;
  measured: boolean;
  ncrps: number | null;
  crps: number | null;
  mae: number | null;
  rmse: number | null;
  wall: number | null;
  cpu: number | null;
  mem: number | null;
  /** Run-record panel subtitle: suite + full-ish commit, or the bare pin. */
  suiteLine: string;
  /** The command that produced (or would produce) this row. */
  cmd: string;
}

export interface BenchmarkSuiteView {
  dataset: string;
  datasetName: string;
  /** "Laos admin-1 monthly · horizon 3" */
  heading: string;
  /** "1 of 5 listed models evaluated" */
  countLine: string;
  measured: number;
  runContext: { k: string; v: string }[];
  /** Under-table note about pins with no run yet; null when all are measured. */
  pendingNote: string | null;
  rows: BenchmarkRowView[];
}

const NUMBER_WORDS = [
  "No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
];

function periodUnit(periodType: string | undefined): string {
  if (periodType === "monthly") return "months";
  if (periodType === "weekly") return "weeks";
  if (periodType === "yearly") return "years";
  return "periods";
}

type RunParams = NonNullable<Benchmark["run"]>;

function evalCmd(
  modelId: string,
  pinShort: string,
  dataset: string,
  run: RunParams | undefined,
): string {
  const flags = [
    run?.horizon !== undefined ? `--horizon ${run.horizon}` : null,
    run?.splits !== undefined ? `--splits ${run.splits}` : null,
    run?.samples !== undefined ? `--samples ${run.samples}` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    `chap eval --model ${modelId} \\\n  --commit ${pinShort} --dataset ${dataset}` +
    (flags ? ` \\\n  ${flags}` : "")
  );
}

function suiteIdOf(bench: Benchmark): string | null {
  return bench.run?.configuration
    ? `${bench.model}.${bench.run.configuration}`
    : null;
}

/**
 * One suite per dataset that has recorded runs: measured rows first (best
 * normalised CRPS first, plain CRPS as fallback), then every other listed
 * model at its stable pin as an unmeasured row. Reproduce commands for
 * unmeasured rows reuse the suite's run parameters so a filled-in row stays
 * comparable.
 */
export function buildBenchmarkSuites(
  registry: Registry,
  records: Benchmark[],
): BenchmarkSuiteView[] {
  const byId = new Map(registry.models.map((m) => [m.id, m]));
  const datasets = [...new Set(records.map((b) => b.dataset))].sort();

  return datasets.map((dataset) => {
    const runs = records.filter((b) => b.dataset === dataset);
    const primary = runs[0];
    const params = primary.run;
    const datasetName = datasetNameFor(dataset);

    const measuredRows = runs
      .map((b): BenchmarkRowView => {
        const model = byId.get(b.model)!;
        return {
          id: `${b.model}@${b.version}`,
          modelId: b.model,
          name: model.display_name,
          versionTag: b.version,
          pinLine: `${b.model}@${shortCommit(b.commit)} · ${b.version}`,
          measured: true,
          ncrps: b.metrics.norm_crps ?? null,
          crps: b.metrics.crps,
          mae: b.metrics.mae ?? null,
          rmse: b.metrics.rmse ?? null,
          wall: b.resources?.wall_seconds ?? null,
          cpu: b.resources?.cpu_seconds ?? null,
          mem: b.resources?.peak_memory_mb ?? null,
          suiteLine: `${suiteIdOf(b) ?? b.harness.tool} · ${b.commit.slice(0, 12)}…`,
          cmd: evalCmd(b.model, shortCommit(b.commit), dataset, b.run),
        };
      })
      .sort(
        (a, b) =>
          (a.ncrps ?? a.crps ?? Infinity) - (b.ncrps ?? b.crps ?? Infinity),
      );

    const measuredModels = new Set(runs.map((b) => b.model));
    const pendingRows = registry.models
      .filter((m) => !measuredModels.has(m.id))
      .map((m): BenchmarkRowView => {
        const stable = stableVersion(m);
        return {
          id: `${m.id}@${stable.version}`,
          modelId: m.id,
          name: m.display_name,
          versionTag: stable.version,
          pinLine: `${m.id}@${shortCommit(stable.commit)} · ${stable.version}`,
          measured: false,
          ncrps: null,
          crps: null,
          mae: null,
          rmse: null,
          wall: null,
          cpu: null,
          mem: null,
          suiteLine: `${m.id}@${shortCommit(stable.commit)}`,
          cmd: evalCmd(m.id, shortCommit(stable.commit), dataset, params),
        };
      });

    const runContext: { k: string; v: string }[] = [];
    const suiteId = suiteIdOf(primary);
    if (suiteId) runContext.push({ k: "Suite", v: suiteId });
    runContext.push({ k: "Dataset", v: datasetName });
    if (params?.observations !== undefined) {
      runContext.push({
        k: "Observations",
        v: `${params.observations.toLocaleString("en-US")} rows`,
      });
    }
    const unit = periodUnit(
      byId.get(primary.model)?.compatibility.period_types[0],
    );
    if (params?.horizon !== undefined) {
      runContext.push({ k: "Horizon", v: `${params.horizon} ${unit}` });
    }
    if (params?.splits !== undefined) {
      runContext.push({ k: "Backtest splits", v: String(params.splits) });
    }
    if (params?.samples !== undefined) {
      runContext.push({ k: "Predictive samples", v: String(params.samples) });
    }
    runContext.push({ k: "Harness", v: primary.harness.tool });

    const pendingNote =
      pendingRows.length === 0
        ? null
        : pendingRows.length === 1
          ? "One listed model has no evaluation on this suite yet. A row appears the moment a run lands — the page never interpolates a score."
          : `${NUMBER_WORDS[pendingRows.length] ?? pendingRows.length} listed models have no evaluation on this suite yet. A row appears the moment a run lands — the page never interpolates a score.`;

    return {
      dataset,
      datasetName,
      heading:
        params?.horizon !== undefined
          ? `${datasetName} · horizon ${params.horizon}`
          : datasetName,
      countLine: `${measuredModels.size} of ${registry.models.length} listed models evaluated`,
      measured: measuredModels.size,
      runContext,
      pendingNote,
      rows: [...measuredRows, ...pendingRows],
    };
  });
}
