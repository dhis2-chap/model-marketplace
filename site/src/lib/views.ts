import { stringify } from "yaml";
import {
  displayPin,
  fullPin,
  latestVersion,
  repoOrg,
  repoSlug,
  shortCommit,
  stableVersion,
  verifiedCount,
  type Registry,
} from "./registry";
import type { Benchmark, Model, ModelVersion } from "./schema";
import { benchmarksFor, skillOf } from "./benchmarks";
import type { Proposals } from "./proposals";
import {
  COV_LABEL,
  datasetNameFor,
  presentationFor,
  type CovariateMode,
} from "./presentation";
import { BASELINE_CRPS, mockBenchmarksFor } from "./mock-benchmarks";

/**
 * Serializable card view of a model, built on the server and handed to the
 * client components that do search/filter. Everything the interactive
 * catalog needs, nothing more.
 */
export interface ModelCardView {
  id: string;
  name: string;
  shortName: string;
  repo: string;
  maturity: "stable" | "experimental";
  summary: string;
  framework: string;
  covMode: CovariateMode;
  covLabel: string;
  periodType: string;
  horizon: number | null;
  stableTag: string;
  stablePinDisplay: string;
  stablePinFull: string;
  approvals: string;
  /** Real CRPS-by-horizon when the store has it; labeled mock otherwise. */
  spark: number[];
  sparkLabel: string;
}

/** The model's stored results, stable-channel pin first, then by dataset. */
function recordsFor(model: Model, benchmarks: Benchmark[]): Benchmark[] {
  return benchmarksFor(benchmarks, model.id).sort(
    (a, b) =>
      Number(b.version === model.channels.stable) -
        Number(a.version === model.channels.stable) ||
      a.dataset.localeCompare(b.dataset),
  );
}

export function toCardView(model: Model, benchmarks: Benchmark[]): ModelCardView {
  const pres = presentationFor(model.id);
  const stable = stableVersion(model);
  const real = recordsFor(model, benchmarks).find(
    (b) => b.metrics.crps_by_horizon,
  );
  return {
    id: model.id,
    name: model.display_name,
    shortName: pres.shortName,
    repo: repoSlug(model),
    maturity: model.maturity,
    summary: model.summary,
    framework: pres.framework,
    covMode: pres.covMode,
    covLabel: COV_LABEL[pres.covMode],
    periodType: model.compatibility.period_types.join(" · "),
    horizon: model.compatibility.max_prediction_length ?? null,
    stableTag: model.channels.stable,
    stablePinDisplay: displayPin(model, stable),
    stablePinFull: fullPin(model, stable),
    approvals: `${verifiedCount(model) > 0 ? "3/3" : "0/3"}`,
    spark: real
      ? real.metrics.crps_by_horizon!
      : (mockBenchmarksFor(model.id)?.spark ?? []),
    sparkLabel: real ? `CRPS by horizon · ${real.dataset}` : "CRPS · illustrative",
  };
}

/* ---------- in-review (open PR) views ---------- */

export interface InReviewPinView {
  modelId: string;
  /** On the model's own Versions tab: the proposed tag (or the model name). */
  label: string;
  /** On the catalog strip, where the model needs naming too. */
  catalogLabel: string;
  commitShort: string | null;
  isNewModel: boolean;
  approvals: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  author: string;
  updatedAt: string;
}

function approvalsLabel(count: number, required: number): string {
  return `${Math.min(count, required)}/${required}`;
}

/** "as of" label for PR-derived data — the fetch happens once per build. */
export function fetchedAtLabel(fetchedAt: string | null): string | null {
  return fetchedAt
    ? `${fetchedAt.slice(0, 16).replace("T", " ")} UTC`
    : null;
}

export function toInReviewViews(
  proposals: Proposals,
  required: number,
): InReviewPinView[] {
  return proposals.proposals.flatMap((pr) =>
    pr.pins.map((pin) => ({
      modelId: pin.modelId,
      label: pin.versionTag ?? pin.displayName,
      catalogLabel: pin.isNewModel
        ? pin.versionTag
          ? `${pin.displayName} · ${pin.versionTag}`
          : pin.displayName
        : `${pin.modelId} · ${pin.versionTag ?? "?"}`,
      commitShort: pin.commit ? shortCommit(pin.commit) : null,
      isNewModel: pin.isNewModel,
      approvals: approvalsLabel(pr.approvedBy.length, required),
      prNumber: pr.number,
      prTitle: pr.title,
      prUrl: pr.url,
      author: pr.author,
      updatedAt: pr.updatedAt.slice(0, 10),
    })),
  );
}

/* ---------- detail view ---------- */

export interface ChannelView {
  channel: "stable" | "latest";
  tag: string;
  status: string;
  pinDisplay: string;
  pinFull: string;
}

export interface VersionRowView {
  tag: string;
  pinDisplay: string;
  pinFull: string;
  status: string;
  verifiedBy: string[];
  changelog: string | null;
  notes: string | null;
  isStable: boolean;
  isLatest: boolean;
}

export interface ConfigurationView {
  key: string;
  description: string;
  yaml: string;
}

export interface BenchmarksView {
  /** "real" renders from the benchmarks/ store; "mock" from labeled fixtures. */
  source: "real" | "mock";
  crpsByHorizon: number[];
  baseline: number[];
  comparison: { name: string; mean: number; self: boolean }[];
  countrySkill: [string, number][];
  /** Real only: provenance + headline metrics of the primary record. */
  provenance: {
    dataset: string;
    versionTag: string;
    evaluatedAt: string;
    harnessTool: string;
    runUrl: string | null;
  } | null;
  headline: { label: string; value: string }[];
}

export interface ModelDetailView {
  id: string;
  name: string;
  shortName: string;
  maturity: "stable" | "experimental";
  summary: string;
  repo: string;
  repoUrl: string;
  org: string;
  maintainers: string[];
  mlprojectName: string | null;
  framework: string;
  covLabel: string;
  periodType: string;
  horizon: number | null;
  requiredCovariates: string[];
  additionalCovariates: string[];
  stable: ChannelView;
  latest: ChannelView;
  latestSameAsStable: boolean;
  versions: VersionRowView[];
  inReview: InReviewPinView[];
  inReviewAsOf: string | null;
  configurations: ConfigurationView[];
  benchmarks: BenchmarksView | null;
  /** Cross-model benchmark state for the CTA card; null while no run exists. */
  benchmarkSummary: {
    measured: number;
    listed: number;
    suiteNames: string[];
  } | null;
  verifiedPins: number;
  reviews: number;
  installUrl: string;
}

function toChannelView(
  model: Model,
  channel: "stable" | "latest",
  version: ModelVersion,
): ChannelView {
  return {
    channel,
    tag: version.version,
    status: version.status,
    pinDisplay: displayPin(model, version),
    pinFull: fullPin(model, version),
  };
}

/** Serialize a configuration block back to the standalone
 * --model-configuration-yaml file a user copies into chap. */
function configYaml(config: {
  user_option_values: Record<string, unknown>;
  additional_continuous_covariates?: string[];
}): string {
  const doc: Record<string, unknown> = {
    user_option_values: config.user_option_values,
  };
  if (config.additional_continuous_covariates?.length) {
    doc.additional_continuous_covariates =
      config.additional_continuous_covariates;
  }
  return stringify(doc, { lineWidth: 0 });
}

function realBenchmarksView(
  model: Model,
  registry: Registry,
  benchmarks: Benchmark[],
): BenchmarksView | null {
  const records = recordsFor(model, benchmarks);
  const primary = records.find((b) => b.metrics.crps_by_horizon) ?? records[0];
  if (!primary) return null;

  const comparison = registry.models
    .map((m) => {
      const onDataset = benchmarksFor(benchmarks, m.id).filter(
        (b) => b.dataset === primary.dataset,
      );
      const mean =
        onDataset.length > 0
          ? onDataset.reduce((s, b) => s + b.metrics.crps, 0) / onDataset.length
          : null;
      return { name: presentationFor(m.id).abbrev, mean, self: m.id === model.id };
    })
    .filter((c): c is { name: string; mean: number; self: boolean } =>
      typeof c.mean === "number",
    );

  const skill = skillOf(primary);
  const headline: { label: string; value: string }[] = [
    { label: "Mean CRPS", value: primary.metrics.crps.toFixed(2) },
    ...(primary.metrics.mae !== undefined
      ? [{ label: "MAE", value: primary.metrics.mae.toFixed(1) }]
      : []),
    ...(primary.metrics.rmse !== undefined
      ? [{ label: "RMSE", value: primary.metrics.rmse.toFixed(1) }]
      : []),
    ...(primary.metrics.norm_crps !== undefined
      ? [
          {
            label: "Normalised CRPS",
            value: primary.metrics.norm_crps.toFixed(6),
          },
        ]
      : []),
    ...(primary.metrics.coverage_80 !== undefined
      ? [{ label: "Coverage 80%", value: primary.metrics.coverage_80.toFixed(2) }]
      : []),
    ...(skill !== null
      ? [{ label: "Skill vs baseline", value: `+${skill.toFixed(2)}` }]
      : []),
  ];

  return {
    source: "real",
    crpsByHorizon: primary.metrics.crps_by_horizon ?? [],
    baseline: primary.metrics.baseline_crps_by_horizon ?? [],
    comparison: comparison.length > 1 ? comparison : [],
    countrySkill: [],
    provenance: {
      dataset: primary.dataset,
      versionTag: primary.version,
      evaluatedAt: primary.evaluated_at,
      harnessTool: primary.harness.tool,
      runUrl: primary.harness.run ?? null,
    },
    headline,
  };
}

function mockBenchmarksView(
  model: Model,
  registry: Registry,
): BenchmarksView | null {
  const mocks = mockBenchmarksFor(model.id);
  if (!mocks) return null;
  const comparison = registry.models
    .map((m) => ({
      name: presentationFor(m.id).abbrev,
      mean: mockBenchmarksFor(m.id)?.comparisonMean,
      self: m.id === model.id,
    }))
    .filter((c): c is { name: string; mean: number; self: boolean } =>
      typeof c.mean === "number",
    );
  return {
    source: "mock",
    crpsByHorizon: mocks.crpsByHorizon,
    baseline: BASELINE_CRPS,
    comparison,
    countrySkill: mocks.countrySkill,
    provenance: null,
    headline: [],
  };
}

export function toDetailView(
  model: Model,
  registry: Registry,
  benchmarks: Benchmark[],
  proposals: Proposals,
): ModelDetailView {
  const pres = presentationFor(model.id);
  const stable = stableVersion(model);
  const latest = latestVersion(model);
  const required = registry.index.review_policy.required_approvals;
  const verifiedPins = verifiedCount(model);

  return {
    id: model.id,
    name: model.display_name,
    shortName: pres.shortName,
    maturity: model.maturity,
    summary: model.summary,
    repo: repoSlug(model),
    repoUrl: model.source.repository,
    org: repoOrg(model),
    maintainers: model.maintainers,
    mlprojectName: model.source.mlproject_name ?? null,
    framework: pres.framework,
    covLabel: COV_LABEL[pres.covMode],
    periodType: model.compatibility.period_types.join(" · "),
    horizon: model.compatibility.max_prediction_length ?? null,
    requiredCovariates: model.covariates.required,
    additionalCovariates: model.covariates.additional_continuous,
    stable: toChannelView(model, "stable", stable),
    latest: toChannelView(model, "latest", latest),
    latestSameAsStable: model.channels.stable === model.channels.latest,
    versions: model.versions.map((v) => ({
      tag: v.version,
      pinDisplay: displayPin(model, v),
      pinFull: fullPin(model, v),
      status: v.status,
      verifiedBy: v.verified_by,
      changelog: v.changelog,
      notes: v.notes ?? null,
      isStable: v.version === model.channels.stable,
      isLatest: v.version === model.channels.latest,
    })),
    inReview: toInReviewViews(proposals, required).filter(
      (pin) => pin.modelId === model.id,
    ),
    inReviewAsOf: fetchedAtLabel(proposals.fetchedAt),
    configurations: Object.entries(model.configurations).map(
      ([key, config]) => ({
        key,
        description: config.description,
        yaml: configYaml(config),
      }),
    ),
    benchmarks:
      realBenchmarksView(model, registry, benchmarks) ??
      mockBenchmarksView(model, registry),
    benchmarkSummary:
      benchmarks.length > 0
        ? {
            measured: new Set(benchmarks.map((b) => b.model)).size,
            listed: registry.models.length,
            suiteNames: [
              ...new Set(benchmarks.map((b) => datasetNameFor(b.dataset))),
            ],
          }
        : null,
    verifiedPins,
    reviews: verifiedPins * required,
    installUrl:
      registry.index.marketplace.documentation.install ??
      "https://chap.dhis2.org",
  };
}
