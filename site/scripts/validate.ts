/**
 * Standalone registry validation: `pnpm validate`.
 * Loads registry.yaml and every model file through the same zod schema the
 * site build uses, so a model PR gets a red check without building the site.
 */
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
  console.log("\nAll files valid.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
