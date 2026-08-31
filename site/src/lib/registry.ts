import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import {
  modelSchema,
  registrySchema,
  type Model,
  type ModelVersion,
  type RegistryIndex,
} from "./schema";

/**
 * Build-time loader for the YAML registry at the repository root. The repo
 * is the source of truth; the site is a rendering of it. Any schema
 * violation throws, which fails `next build` and `pnpm validate`.
 */

export interface Registry {
  /** Repo root the registry was loaded from (benchmarks/ lives beside it). */
  root: string;
  index: RegistryIndex;
  models: Model[];
}

/** site/ lives one level below the registry; validate can also run from the repo root. */
export function findRepoRoot(start = process.cwd()): string {
  let dir = start;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(dir, "registry.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`registry.yaml not found walking up from ${start}`);
}

function loadYaml(file: string): unknown {
  return parse(fs.readFileSync(file, "utf8"));
}

export function loadRegistry(root = findRepoRoot()): Registry {
  const indexFile = path.join(root, "registry.yaml");
  const parsedIndex = registrySchema.safeParse(loadYaml(indexFile));
  if (!parsedIndex.success) {
    throw new Error(`registry.yaml is invalid:\n${parsedIndex.error.message}`);
  }
  const index = parsedIndex.data;

  const ids = new Set<string>();
  const models = index.models.map((relPath) => {
    const file = path.join(root, relPath);
    const parsed = modelSchema.safeParse(loadYaml(file));
    if (!parsed.success) {
      throw new Error(`${relPath} is invalid:\n${parsed.error.message}`);
    }
    const model = parsed.data;
    const expectedId = path.basename(relPath, ".yaml");
    if (model.id !== expectedId) {
      throw new Error(
        `${relPath}: id "${model.id}" does not match the filename`,
      );
    }
    if (ids.has(model.id)) {
      throw new Error(`${relPath}: duplicate model id "${model.id}"`);
    }
    ids.add(model.id);
    return model;
  });

  return { root, index, models };
}

let cached: Registry | null = null;

export function getRegistry(): Registry {
  cached ??= loadRegistry();
  return cached;
}

export function getModel(id: string): Model | undefined {
  return getRegistry().models.find((m) => m.id === id);
}

/* ---------- derived views ---------- */

export function repoSlug(model: Model): string {
  return model.source.repository.replace(/^https?:\/\//, "");
}

export function repoOrg(model: Model): string {
  return repoSlug(model).split("/")[1] ?? "";
}

export function shortCommit(commit: string): string {
  return commit.slice(0, 7);
}

export function versionByTag(
  model: Model,
  tag: string,
): ModelVersion | undefined {
  return model.versions.find((v) => v.version === tag);
}

export function stableVersion(model: Model): ModelVersion {
  const v = versionByTag(model, model.channels.stable);
  if (!v) throw new Error(`${model.id}: stable channel does not resolve`);
  return v;
}

export function latestVersion(model: Model): ModelVersion {
  const v = versionByTag(model, model.channels.latest);
  if (!v) throw new Error(`${model.id}: latest channel does not resolve`);
  return v;
}

/** The pin as chap consumes it: repository URL + full commit hash. */
export function fullPin(model: Model, version: ModelVersion): string {
  return `${model.source.repository}@${version.commit}`;
}

/** The pin as the UI displays it: repo slug + short commit. */
export function displayPin(model: Model, version: ModelVersion): string {
  return `${repoSlug(model)}@${shortCommit(version.commit)}`;
}

export function verifiedCount(model: Model): number {
  return model.versions.filter((v) => v.status === "verified").length;
}

export function marketplaceStats(registry: Registry) {
  const verifiedPins = registry.models.reduce(
    (n, m) => n + verifiedCount(m),
    0,
  );
  return {
    models: registry.models.length,
    verifiedPins,
    reviews: verifiedPins * registry.index.review_policy.required_approvals,
  };
}
