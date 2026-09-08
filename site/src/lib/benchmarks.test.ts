import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stringify } from "yaml";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildBenchmarkSuites,
  loadBenchmarks,
  skillOf,
} from "./benchmarks";
import { loadRegistry, shortCommit, stableVersion } from "./registry";
import type { Benchmark } from "./schema";

const registry = loadRegistry();
const ewars = registry.models.find((m) => m.id === "chapkit_ewars_model")!;
const ewarsStable = stableVersion(ewars);
const multistep = registry.models.find((m) => m.id === "chapkit_simple_multistep_model")!;
const multistepStable = stableVersion(multistep);

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

/** The shape of the repo's first real record: a full chap eval run. */
function smokeRun(overrides: Partial<Benchmark> = {}): Benchmark {
  return benchmark({
    model: multistep.id,
    version: multistepStable.version,
    commit: multistepStable.commit,
    dataset: "laos-admin1-monthly",
    harness: { tool: "chap eval" },
    run: {
      configuration: "monthly_climate",
      observations: 2808,
      horizon: 3,
      splits: 1,
      samples: 200,
    },
    metrics: { crps: 42.6692, mae: 57.0358, rmse: 108.3282, norm_crps: 0.045345 },
    resources: { wall_seconds: 56.61, cpu_seconds: 22.05, peak_memory_mb: 2061.8 },
    ...overrides,
  });
}

describe("loadBenchmarks", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "mp-bench-"));
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function write(b: Benchmark, relPath?: string) {
    const file = path.join(
      root,
      relPath ?? `benchmarks/${b.model}/${b.version}/${b.dataset}.yaml`,
    );
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, stringify(b));
  }

  it("returns [] when the benchmarks directory does not exist", () => {
    expect(loadBenchmarks(registry, root)).toEqual([]);
  });

  it("loads a valid file addressed by its (model, version, dataset) path", () => {
    write(benchmark());
    const loaded = loadBenchmarks(registry, root);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].metrics.crps).toBe(0.5);
  });

  it("round-trips the run, extra metric and resource fields", () => {
    write(smokeRun());
    const [loaded] = loadBenchmarks(registry, root);
    expect(loaded.run?.configuration).toBe("monthly_climate");
    expect(loaded.run?.samples).toBe(200);
    expect(loaded.metrics.rmse).toBeCloseTo(108.3282);
    expect(loaded.metrics.norm_crps).toBeCloseTo(0.045345);
    expect(loaded.resources?.peak_memory_mb).toBeCloseTo(2061.8);
  });

  it("rejects a file whose path disagrees with its content", () => {
    const b = benchmark();
    write(b, `benchmarks/${b.model}/${b.version}/other-dataset.yaml`);
    expect(() => loadBenchmarks(registry, root)).toThrow(/does not match the file path/);
  });

  it("rejects a file outside the <model>/<version>/<dataset> layout", () => {
    write(benchmark(), "benchmarks/loose.yaml");
    expect(() => loadBenchmarks(registry, root)).toThrow(/must be benchmarks\//);
  });

  it("rejects a model the registry does not list", () => {
    write(benchmark({ model: "ghost_model" }));
    expect(() => loadBenchmarks(registry, root)).toThrow(/not in the registry/);
  });

  it("rejects a commit that does not match the registry pin", () => {
    write(benchmark({ commit: "0".repeat(40) }));
    expect(() => loadBenchmarks(registry, root)).toThrow(/commit does not match the pin/);
  });

  it("rejects a run configuration the model file does not declare", () => {
    write(smokeRun({ run: { configuration: "nightly" } }));
    expect(() => loadBenchmarks(registry, root)).toThrow(
      /configuration "nightly" is not in models\/chapkit_simple_multistep_model\.yaml/,
    );
  });
});

describe("skillOf", () => {
  it("derives skill only when the baseline is stored", () => {
    expect(skillOf(benchmark({ metrics: { crps: 0.5, baseline_crps: 1.0 } }))).toBe(0.5);
    expect(skillOf(benchmark())).toBeNull();
  });
});

describe("buildBenchmarkSuites", () => {
  it("is empty while the store is empty", () => {
    expect(buildBenchmarkSuites(registry, [])).toEqual([]);
  });

  it("builds one suite per dataset: measured rows, then every other pin as not run", () => {
    const suites = buildBenchmarkSuites(registry, [smokeRun()]);
    expect(suites).toHaveLength(1);
    const suite = suites[0];

    expect(suite.heading).toBe("Laos admin-1 monthly · horizon 3");
    expect(suite.countLine).toBe("1 of 6 listed models evaluated");
    expect(suite.runContext).toContainEqual({
      k: "Suite",
      v: "chapkit_simple_multistep_model.monthly_climate",
    });
    expect(suite.runContext).toContainEqual({ k: "Observations", v: "2,808 rows" });
    expect(suite.pendingNote).toMatch(/^Five listed models/);

    expect(suite.rows).toHaveLength(registry.models.length);
    const [first, ...rest] = suite.rows;
    expect(first.measured).toBe(true);
    expect(first.pinLine).toBe(
      `chapkit_simple_multistep_model@${shortCommit(multistepStable.commit)} · ${multistepStable.version}`,
    );
    expect(first.suiteLine).toBe(
      `chapkit_simple_multistep_model.monthly_climate · ${multistepStable.commit.slice(0, 12)}…`,
    );
    for (const row of rest) {
      expect(row.measured).toBe(false);
      expect(row.ncrps).toBeNull();
      expect(row.crps).toBeNull();
    }
  });

  it("reuses the suite's run parameters in an unmeasured row's command", () => {
    const suite = buildBenchmarkSuites(registry, [smokeRun()])[0];
    const pendingEwars = suite.rows.find((r) => r.modelId === ewars.id)!;
    expect(pendingEwars.cmd).toBe(
      `chap eval --model chapkit_ewars_model \\\n  --commit ${shortCommit(ewarsStable.commit)} --dataset laos-admin1-monthly \\\n  --horizon 3 --splits 1 --samples 200`,
    );
  });

  it("ranks measured rows by normalised CRPS ascending", () => {
    const arima = registry.models.find((m) => m.id === "auto_arima_chapkit")!;
    const arimaStable = stableVersion(arima);
    const suite = buildBenchmarkSuites(registry, [
      smokeRun(),
      smokeRun({
        model: arima.id,
        version: arimaStable.version,
        commit: arimaStable.commit,
        run: undefined,
        metrics: { crps: 39.2, norm_crps: 0.041 },
        resources: undefined,
      }),
    ])[0];
    expect(suite.rows.slice(0, 2).map((r) => r.modelId)).toEqual([
      "auto_arima_chapkit",
      "chapkit_simple_multistep_model",
    ]);
    expect(suite.countLine).toBe("2 of 6 listed models evaluated");
    expect(suite.pendingNote).toMatch(/^Four listed models/);
  });
});
