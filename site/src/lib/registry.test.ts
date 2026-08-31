import { describe, expect, it } from "vitest";
import {
  displayPin,
  fullPin,
  loadRegistry,
  marketplaceStats,
  stableVersion,
} from "./registry";
import { modelSchema } from "./schema";

describe("the real registry", () => {
  const registry = loadRegistry();

  it("loads and validates every model file", () => {
    expect(registry.models.length).toBeGreaterThan(0);
    expect(registry.index.review_policy.required_approvals).toBe(3);
  });

  it("carries the marketplace's own repository for open-PR ingestion", () => {
    expect(registry.index.marketplace.repository).toBe(
      "https://github.com/dhis2-chap/model-marketplace",
    );
  });

  it("resolves both channels for every model", () => {
    for (const model of registry.models) {
      expect(stableVersion(model).status).toBe("verified");
    }
  });

  it("derives pins in both display and chap-consumable form", () => {
    const ewars = registry.models.find((m) => m.id === "ewars_template");
    expect(ewars).toBeDefined();
    const stable = stableVersion(ewars!);
    expect(displayPin(ewars!, stable)).toBe("github.com/dhis2-chap/ewars_template@cdd06ed");
    expect(fullPin(ewars!, stable)).toBe(
      "https://github.com/dhis2-chap/ewars_template@cdd06ed61ee0f6eccab1fc9b9d74eb52cb122539",
    );
  });

  it("counts reviews as verified pins × required approvals", () => {
    const stats = marketplaceStats(registry);
    expect(stats.reviews).toBe(stats.verifiedPins * 3);
  });
});

describe("schema refinements", () => {
  const base = {
    schema_version: 1,
    id: "my_model",
    display_name: "My Model",
    maturity: "experimental",
    summary: "A test model.",
    source: { repository: "https://github.com/org/my_model" },
    maintainers: [],
    compatibility: { period_types: ["monthly"] },
    covariates: { required: ["population"], additional_continuous: ["rainfall"] },
    channels: { stable: "v1", latest: "v1" },
    versions: [
      {
        version: "v1",
        commit: "1111111111111111111111111111111111111111",
        status: "verified",
        verified_by: [],
        changelog: null,
      },
    ],
    configurations: {},
  };

  it("accepts a well-formed model", () => {
    expect(modelSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a channel pointing at a missing version", () => {
    const bad = { ...base, channels: { stable: "v1", latest: "v9" } };
    expect(modelSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a stable channel pointing at an unverified version", () => {
    const bad = {
      ...base,
      versions: [{ ...base.versions[0], status: "unstable" }],
    };
    expect(modelSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a short commit hash", () => {
    const bad = {
      ...base,
      versions: [{ ...base.versions[0], commit: "cdd06ed" }],
    };
    expect(modelSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects configurations repeating a required covariate", () => {
    const bad = {
      ...base,
      configurations: {
        monthly: {
          description: "test",
          user_option_values: {},
          additional_continuous_covariates: ["population"],
        },
      },
    };
    expect(modelSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects configurations using undeclared covariates", () => {
    const bad = {
      ...base,
      configurations: {
        monthly: {
          description: "test",
          user_option_values: {},
          additional_continuous_covariates: ["mean_temperature"],
        },
      },
    };
    expect(modelSchema.safeParse(bad).success).toBe(false);
  });
});
