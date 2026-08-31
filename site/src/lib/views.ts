import { stringify } from "yaml";
import {
  displayPin,
  fullPin,
  latestVersion,
  repoOrg,
  repoSlug,
  stableVersion,
  verifiedCount,
  type Registry,
} from "./registry";
import type { Model, ModelVersion } from "./schema";
import { COV_LABEL, presentationFor, type CovariateMode } from "./presentation";
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
  /** MOCK — illustrative CRPS series for the card sparkline. */
  spark: number[];
}

export function toCardView(model: Model): ModelCardView {
  const pres = presentationFor(model.id);
  const stable = stableVersion(model);
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
    spark: mockBenchmarksFor(model.id)?.spark ?? [],
  };
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
  crpsByHorizon: number[];
  baseline: number[];
  comparison: { name: string; mean: number; self: boolean }[];
  countrySkill: [string, number][];
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
  configurations: ConfigurationView[];
  benchmarks: BenchmarksView | null;
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

export function toDetailView(
  model: Model,
  registry: Registry,
): ModelDetailView {
  const pres = presentationFor(model.id);
  const stable = stableVersion(model);
  const latest = latestVersion(model);
  const mocks = mockBenchmarksFor(model.id);
  const required = registry.index.review_policy.required_approvals;
  const verifiedPins = verifiedCount(model);

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
    id: model.id,
    name: model.display_name,
    shortName: pres.shortName,
    maturity: model.maturity,
    summary: model.summary,
    repo: repoSlug(model),
    repoUrl: model.source.repository,
    org: repoOrg(model),
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
    configurations: Object.entries(model.configurations).map(
      ([key, config]) => ({
        key,
        description: config.description,
        yaml: configYaml(config),
      }),
    ),
    benchmarks: mocks
      ? {
          crpsByHorizon: mocks.crpsByHorizon,
          baseline: BASELINE_CRPS,
          comparison,
          countrySkill: mocks.countrySkill,
        }
      : null,
    verifiedPins,
    reviews: verifiedPins * required,
    installUrl:
      registry.index.marketplace.documentation.install ??
      "https://chap.dhis2.org",
  };
}
