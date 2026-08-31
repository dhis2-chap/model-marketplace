/**
 * Standalone registry validation: `pnpm validate`.
 * Loads registry.yaml, every model file and every benchmarks/ file through
 * the same zod schemas the site build uses, so a PR gets a red check without
 * building the site. Stays offline — open-PR ingestion is build-only and
 * fail-soft, so it is not a gate.
 */
import { loadBenchmarks } from "../src/lib/benchmarks";
import {
  displayPin,
  loadRegistry,
  stableVersion,
  verifiedCount,
} from "../src/lib/registry";

try {
  const registry = loadRegistry();
  console.log(`registry.yaml OK — ${registry.models.length} models\n`);
  for (const model of registry.models) {
    const stable = stableVersion(model);
    console.log(
      `  ✓ ${model.id.padEnd(28)} ${model.maturity.padEnd(13)} stable=${displayPin(model, stable)} (${verifiedCount(model)} verified pin${verifiedCount(model) === 1 ? "" : "s"})`,
    );
  }

  const benchmarks = loadBenchmarks(registry, registry.root);
  console.log(
    `\nbenchmarks/ OK — ${benchmarks.length} result file${benchmarks.length === 1 ? "" : "s"}`,
  );
  for (const bench of benchmarks) {
    console.log(
      `  ✓ ${bench.model}@${bench.version} · ${bench.dataset} (crps ${bench.metrics.crps})`,
    );
  }

  console.log("\nAll files valid.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
