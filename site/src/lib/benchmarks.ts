import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { getRegistry, versionByTag, type Registry } from "./registry";
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

/* ---------- leaderboard ---------- */

export interface LeaderboardRow {
  modelId: string;
  versionTag: string;
  /** How many datasets the means below aggregate over. */
  datasets: number;
  crps: number;
  mae: number | null;
  coverage80: number | null;
  skill: number | null;
}

function meanOf(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/**
 * One row per (model, verified version) that has benchmark results, each
 * metric averaged over that pin's datasets, ranked by mean CRPS ascending.
 */
export function buildLeaderboard(
  registry: Registry,
  records: Benchmark[],
): LeaderboardRow[] {
  const rows: LeaderboardRow[] = [];
  for (const model of registry.models) {
    for (const version of model.versions) {
      if (version.status !== "verified") continue;
      const runs = records.filter(
        (b) => b.model === model.id && b.version === version.version,
      );
      if (runs.length === 0) continue;
      rows.push({
        modelId: model.id,
        versionTag: version.version,
        datasets: runs.length,
        crps: meanOf(runs.map((b) => b.metrics.crps))!,
        mae: meanOf(runs.flatMap((b) => b.metrics.mae ?? [])),
        coverage80: meanOf(runs.flatMap((b) => b.metrics.coverage_80 ?? [])),
        skill: meanOf(runs.flatMap((b) => skillOf(b) ?? [])),
      });
    }
  }
  return rows.sort((a, b) => a.crps - b.crps);
}
