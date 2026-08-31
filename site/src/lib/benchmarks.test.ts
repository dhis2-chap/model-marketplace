import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildLeaderboard, loadBenchmarks, skillOf } from "./benchmarks";
import { loadRegistry, stableVersion } from "./registry";
import type { Benchmark } from "./schema";

const registry = loadRegistry();
const ewars = registry.models.find((m) => m.id === "ewars_template")!;
const ewarsStable = stableVersion(ewars);

function benchmark(overrides: Partial<Benchmark> = {}): Benchmark {
  return {
    schema_version: 1,
    model: ewars.id,
    version: ewarsStable.version,
    commit: ewarsStable.commit,
    dataset: "dengue-brazil-monthly",
    evaluated_at: "2026-08-31",
    harness: { tool: "chap evaluate-ensemble" },
    metrics: { crps: 0.5 },
    ...overrides,
  } as Benchmark;
}

describe("loadBenchmarks", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "mp-bench-"));
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function write(relPath: string, content: string) {
    const file = path.join(root, relPath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }

  function yamlFor(b: Benchmark): string {
    return [
      "schema_version: 1",
      `model: ${b.model}`,
      `version: ${b.version}`,
      `commit: "${b.commit}"`,
      `dataset: ${b.dataset}`,
      `evaluated_at: "${b.evaluated_at}"`,
      "harness:",
      `  tool: ${b.harness.tool}`,
      "metrics:",
      `  crps: ${b.metrics.crps}`,
    ].join("\n");
  }

  it("returns [] when the benchmarks directory does not exist", () => {
    expect(loadBenchmarks(registry, root)).toEqual([]);
  });

  it("loads a valid file addressed by its (model, version, dataset) path", () => {
    const b = benchmark();
    write(`benchmarks/${b.model}/${b.version}/${b.dataset}.yaml`, yamlFor(b));
    const loaded = loadBenchmarks(registry, root);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].metrics.crps).toBe(0.5);
  });

  it("rejects a file whose path disagrees with its content", () => {
    const b = benchmark();
    write(`benchmarks/${b.model}/${b.version}/other-dataset.yaml`, yamlFor(b));
    expect(() => loadBenchmarks(registry, root)).toThrow(/does not match the file path/);
  });

  it("rejects a file outside the <model>/<version>/<dataset> layout", () => {
    write("benchmarks/loose.yaml", yamlFor(benchmark()));
    expect(() => loadBenchmarks(registry, root)).toThrow(/must be benchmarks\//);
  });

  it("rejects a model the registry does not list", () => {
    const b = benchmark({ model: "ghost_model" });
    write(`benchmarks/${b.model}/${b.version}/${b.dataset}.yaml`, yamlFor(b));
    expect(() => loadBenchmarks(registry, root)).toThrow(/not in the registry/);
  });

  it("rejects a commit that does not match the registry pin", () => {
    const b = benchmark({ commit: "0".repeat(40) });
    write(`benchmarks/${b.model}/${b.version}/${b.dataset}.yaml`, yamlFor(b));
    expect(() => loadBenchmarks(registry, root)).toThrow(/commit does not match the pin/);
  });
});

describe("skillOf", () => {
  it("derives skill only when the baseline is stored", () => {
    expect(skillOf(benchmark({ metrics: { crps: 0.5, baseline_crps: 1.0 } }))).toBe(0.5);
    expect(skillOf(benchmark())).toBeNull();
  });
});

describe("buildLeaderboard", () => {
  const pymc = registry.models.find((m) => m.id === "chap_pymc")!;
  const pymcStable = stableVersion(pymc);

  it("is empty while the store is empty", () => {
    expect(buildLeaderboard(registry, [])).toEqual([]);
  });

  it("averages per (model, version) over datasets and ranks by CRPS ascending", () => {
    const records: Benchmark[] = [
      benchmark({ dataset: "dataset-a", metrics: { crps: 0.6, mae: 12 } }),
      benchmark({ dataset: "dataset-b", metrics: { crps: 0.4, baseline_crps: 0.8 } }),
      benchmark({
        model: pymc.id,
        version: pymcStable.version,
        commit: pymcStable.commit,
        metrics: { crps: 0.3 },
      }),
    ];
    const rows = buildLeaderboard(registry, records);
    expect(rows.map((r) => r.modelId)).toEqual(["chap_pymc", "ewars_template"]);
    const ewarsRow = rows[1];
    expect(ewarsRow.datasets).toBe(2);
    expect(ewarsRow.crps).toBeCloseTo(0.5);
    expect(ewarsRow.mae).toBe(12); // averaged over the files that carry it
    expect(ewarsRow.skill).toBeCloseTo(0.5); // 1 - 0.4/0.8, from the one baseline
    expect(rows[0].mae).toBeNull();
  });
});
