# Model registry format (draft, schema_version 1)

One YAML file per whitelisted model. Everything in this directory has been
reviewed and verified by the CHAP maintainers — a model, a new version pin, or
a new verified configuration only lands here through a pull request approved
by three maintainers. The marketplace site is a rendering of these files; the
repo stays the source of truth and the review gate.

`../registry.yaml` is the index: marketplace metadata, the review policy, and
the ordered list of model files.

This format is a first draft and expected to change. Bump `schema_version`
when it does.

## Annotated example

The example below is illustrative (fictional commits) and shows the full
shape, including a model that has both a verified stable version and a newer
unreviewed one.

```yaml
schema_version: 1                # format version of this file

id: my_model                     # unique id, used by the site and by chap
display_name: My Model           # human-readable name for the catalog
maturity: stable                 # which set the model is browsed under:
                                 #   stable | experimental

summary: >-                      # one paragraph for the catalog card and the
  What the model is and when     # top of the model page
  to use it.

source:
  repository: https://github.com/org/my_model
  mlproject_name: other_name     # optional: only when the MLproject name in
                                 # the repo — the name chapkit's MLproject
                                 # runner serves the model under — differs
                                 # from `id`

maintainers:                     # GitHub handles responsible for the listing
  - somebody

compatibility:
  period_types: [monthly]        # monthly | weekly | ...
  max_prediction_length: 3       # optional: only if the model declares one

covariates:
  required:                      # supplied automatically by chap; never
    - population                 # repeated in configurations
  additional_continuous:         # covariates the model can take via
    - rainfall                   # additional_continuous_covariates; empty
                                 # list = takes none

channels:                        # named pointers into `versions`
  stable: v2                     # newest *verified* pin — what production
                                 # chap instances should use
  latest: v3                     # newest pin of any status; diverges from
                                 # stable while a new version is under review

versions:                        # newest first
  - version: v3
    commit: 0000000000000000000000000000000000000000
    status: unstable             # verified | unstable | deprecated | yanked
    verified_by: []              # empty until three maintainers approve
    changelog: >-
      What changed since v2.
  - version: v2
    commit: 1111111111111111111111111111111111111111
    status: verified
    verified_by: [maintainer-a, maintainer-b, maintainer-c]
    changelog: >-
      What changed since v1.
  - version: v1
    commit: 2222222222222222222222222222222222222222
    status: deprecated
    verified_by: [maintainer-a, maintainer-b, maintainer-c]
    changelog: null

configurations:                  # verified, copy-pasteable configurations
  monthly:
    description: >-
      When to use this configuration and what its caveats are.
    user_option_values:
      some_option: 12
    additional_continuous_covariates:   # omit if the model takes none
      - rainfall
```

## How the fields map to chap

- A version pin resolves to `<source.repository>@<commit>`. Only models run by
  [chapkit](https://dhis2-chap.github.io/chapkit/) are supported for now: the
  pinned commit is served as a chapkit model service — an MLproject repository
  started with `chapkit mlproject run`, or a scaffolded chapkit service image —
  and chap is pointed at the service URL with
  `chap eval --model-name <url> --run-config.is-chapkit-model`
  (see [the chap docs](https://chap.dhis2.org/chap-modeling-platform/external_models/chapkit/)).
- A listed model must run under one of chapkit's published runtimes
  ([dhis2-chap/chapkit-images](https://github.com/dhis2-chap/chapkit-images)):
  Python MLprojects declare `uv_env` and run in `chapkit-py(-cli)`; R
  MLprojects run in `chapkit-r(-cli)`, or `chapkit-r-tidyverse` /
  `chapkit-r-inla` when they need those package stacks. A legacy `docker_env`
  in the MLproject (as in `ewars_template`) is not used by chapkit — the
  matching chapkit image provides the runtime instead. Each model file notes
  its runtime in a comment under `source:`.
- Every block under `configurations:` is a valid standalone
  `--model-configuration-yaml` file for `chap eval` and
  `chap evaluate-ensemble`: copy the inner keys (`user_option_values`,
  `additional_continuous_covariates`) into their own file.
- `covariates.required` are supplied automatically by chap and are therefore
  never repeated under `additional_continuous_covariates` in configurations.

## Conventions

- `channels.stable` must point at a version with `status: verified`.
- `maintainers` lists the GitHub handles responsible for the listing. The
  current entries were backfilled from each source repository's contributors;
  corrections land like everything else, by PR.
- `versions[].verified_by` lists the three approving maintainers of the PR
  that added the pin. `[]` on a verified pin means the pin was verified by
  the merge gate itself without named approvals on record — true for the
  seed import, which predates this repo's PR flow. Pins added by PR going
  forward record their approvers.
- Version keys are whatever upstream uses (`v6`, `uv`, `stable`, ...); we do
  not rename them, the channel pointers provide the uniform interface.
- `changelog` is per-version, free text. `null` until we have one.

## Benchmarks

Benchmark results do not live in these files: they live in the sibling
[`../benchmarks/`](../benchmarks/README.md) directory, one YAML file per
(model, version, dataset), cross-checked against the pins here at build time.

## Open questions for this draft

- Are `stable`/`experimental` the right sets, and is per-model maturity the
  right granularity (vs. per-version)?
- Do dataset-specific configuration bundles stay a separate concept, or are
  verified per-model configurations enough?
