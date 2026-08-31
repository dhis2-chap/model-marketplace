import { describe, expect, it } from "vitest";
import { approvingReviewers, proposedPinsInFile } from "./proposals";
import { loadRegistry } from "./registry";

describe("approvingReviewers", () => {
  const at = (i: number) => `2026-08-3${i}T00:00:00Z`;

  it("counts unique reviewers whose latest state-changing review approves", () => {
    expect(
      approvingReviewers(
        [
          { user: "a", state: "APPROVED", submittedAt: at(0) },
          { user: "b", state: "APPROVED", submittedAt: at(1) },
          { user: "a", state: "APPROVED", submittedAt: at(2) },
        ],
        "author",
      ),
    ).toEqual(["a", "b"]);
  });

  it("lets CHANGES_REQUESTED and DISMISSED replace an earlier approval", () => {
    expect(
      approvingReviewers(
        [
          { user: "a", state: "APPROVED", submittedAt: at(0) },
          { user: "a", state: "CHANGES_REQUESTED", submittedAt: at(1) },
          { user: "b", state: "APPROVED", submittedAt: at(0) },
          { user: "b", state: "DISMISSED", submittedAt: at(1) },
        ],
        "author",
      ),
    ).toEqual([]);
  });

  it("does not let a plain comment dismiss an approval (GitHub semantics)", () => {
    expect(
      approvingReviewers(
        [
          { user: "a", state: "APPROVED", submittedAt: at(0) },
          { user: "a", state: "COMMENTED", submittedAt: at(1) },
        ],
        "author",
      ),
    ).toEqual(["a"]);
  });

  it("ignores the PR author's own review", () => {
    expect(
      approvingReviewers(
        [{ user: "author", state: "APPROVED", submittedAt: at(0) }],
        "author",
      ),
    ).toEqual([]);
  });
});

describe("proposedPinsInFile", () => {
  const registry = loadRegistry();
  const ewars = registry.models.find((m) => m.id === "ewars_template")!;
  const v6 = ewars.versions.find((v) => v.version === "v6")!;

  const headWithV7 = [
    "id: ewars_template",
    "display_name: EWARS",
    "versions:",
    "  - version: v7",
    `    commit: ${"a".repeat(40)}`,
    "    status: unstable",
    "  - version: v6",
    `    commit: ${v6.commit}`,
    "    status: verified",
  ].join("\n");

  it("reports only version tags main does not already pin", () => {
    const pins = proposedPinsInFile("models/ewars_template.yaml", headWithV7, ewars);
    expect(pins).toEqual([
      {
        modelId: "ewars_template",
        displayName: "EWARS",
        isNewModel: false,
        versionTag: "v7",
        commit: "a".repeat(40),
      },
    ]);
  });

  it("treats a re-pinned existing tag as a proposal", () => {
    const repinned = headWithV7.replace(v6.commit, "b".repeat(40));
    const pins = proposedPinsInFile("models/ewars_template.yaml", repinned, ewars);
    expect(pins.map((p) => p.versionTag).sort()).toEqual(["v6", "v7"]);
  });

  it("reports nothing when the file matches what main lists", () => {
    const unchanged = [
      "id: ewars_template",
      "versions:",
      "  - version: v6",
      `    commit: ${v6.commit}`,
    ].join("\n");
    expect(
      proposedPinsInFile("models/ewars_template.yaml", unchanged, ewars),
    ).toEqual([]);
  });

  it("reports every version of a model main does not have", () => {
    const pins = proposedPinsInFile(
      "models/brand_new.yaml",
      ["id: brand_new", "display_name: Brand New", "versions:", "  - version: v1", `    commit: ${"c".repeat(40)}`].join("\n"),
      undefined,
    );
    expect(pins).toEqual([
      {
        modelId: "brand_new",
        displayName: "Brand New",
        isNewModel: true,
        versionTag: "v1",
        commit: "c".repeat(40),
      },
    ]);
  });

  it("still lists an unreadable or unparseable new model, without pin detail", () => {
    for (const headYaml of [null, "{{{ not yaml"]) {
      expect(proposedPinsInFile("models/wip_model.yaml", headYaml, undefined)).toEqual([
        {
          modelId: "wip_model",
          displayName: "wip_model",
          isNewModel: true,
          versionTag: null,
          commit: null,
        },
      ]);
    }
  });
});
