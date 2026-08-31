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
                                 # the repo differs from `id` and chap needs
                                 # an explicit name override

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

- A version pin resolves to `<source.repository>@<commit>` — the same
  `url` + `@commit` reference that chap's configured-models YAML uses today
  (see [the chap docs](https://chap.dhis2.org/chap-modeling-platform/external_models/)).
- Every block under `configurations:` is a valid standalone
  `--model-configuration-yaml` file for `chap eval` and
  `chap evaluate-ensemble`: copy the inner keys (`user_option_values`,
  `additional_continuous_covariates`) into their own file.
- `covariates.required` are supplied automatically by chap and are therefore
  never repeated under `additional_continuous_covariates` in configurations.

## Conventions

- `channels.stable` must point at a version with `status: verified`.
- `versions[].verified_by` lists the three approving maintainers. The current
  files carry `[]` with a TODO until we backfill the actual approvals.
- Version keys are whatever upstream uses (`v6`, `uv`, `stable`, ...); we do
  not rename them, the channel pointers provide the uniform interface.
- `changelog` is per-version, free text. `null` until we have one.

## Open questions for this draft

- Are `stable`/`experimental` the right sets, and is per-model maturity the
  right granularity (vs. per-version)?
- Should benchmark results live in these files, in a sibling
  `benchmarks/` directory keyed by model id + version, or outside the repo?
- Do dataset-specific configuration bundles (like the original
  `ensemble_bases_monthly.yaml`) stay a separate concept, or are verified
  per-model configurations enough?
