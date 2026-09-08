# Benchmark store (schema_version 1)

Real evaluation output, one YAML file per **(model, version, dataset)**
triple. Results land here the same way everything else does — as a pull
request — so a benchmark number on the site is as reviewable as the pin it
describes.

The site loads this directory at build time through the same zod gate as the
registry (`site/src/lib/schema.ts`): an invalid or inconsistent benchmark
file fails the build. This directory is currently **empty** — no benchmarks
have been run. A model with no real result here shows no score at all: there
are no mock fixtures, no placeholder numbers and no illustrative charts
anywhere on the site. Until the first results land, the benchmarks page and
every per-model Benchmarks tab render a "coming soon" state, gated behind
`BENCHMARKS_LIVE` in `site/src/lib/flags.ts`.

## How the comparison is run — added soon

No benchmarks have been run yet, and exactly how they will be run — harness,
datasets, isolation, backtest parameters, ranking — has not been decided. A
full methodology description will be added here once that is settled and the
first official suite has run. Until then, the sections below describe only the
file contract for recording results, not an existing process.

For the underlying evaluation command, see the CHAP documentation for
[evaluating models](https://chap.dhis2.org/chap-modeling-platform/external_models/running_models_in_chap/).

## Layout

The path is part of the contract and is validated against the file content:

```
benchmarks/<model_id>/<version>/<dataset>.yaml
```

- `<model_id>` must be a model listed in `../registry.yaml`
- `<version>` must be a version tag in that model's file, and the `commit`
  in the benchmark file must equal that version's pinned commit
- `<dataset>` is a lowercase dataset id (`[a-z0-9-]`), e.g.
  `dengue-brazil-monthly`

## Annotated example

Illustrative only — the commit must be a real pin from the model file.

```yaml
schema_version: 1

model: my_model                  # model id from ../registry.yaml
version: v2                      # version tag inside models/my_model.yaml
commit: 1111111111111111111111111111111111111111   # that version's pin
dataset: dengue-brazil-monthly   # dataset id, also the filename

evaluated_at: 2026-08-31         # date the evaluation ran

harness:
  tool: chap eval                # what produced the numbers
  run: https://github.com/...    # optional: CI run / artifact with the raw output

# Optional: the backtest parameters of the run. This is what makes two rows
# on the benchmarks page comparable, so record it whenever the harness reports it.
run:
  configuration: monthly         # configuration key inside the model file
  observations: 2808             # rows in the dataset
  horizon: 3                     # forecast horizon, in the model's period type
  splits: 1                      # backtest splits
  samples: 200                   # predictive samples

metrics:
  crps: 0.63                     # mean CRPS over the backtest (required)
  crps_by_horizon: [0.39, 0.47, 0.58]   # optional, h1..hN
  mae: 11.8                      # optional; like RMSE and CRPS it is in cases,
  rmse: 1.21                     #   so only comparable within one dataset
  norm_crps: 0.045               # optional: normalised CRPS, the one figure
                                 #   comparable across datasets
  coverage_80: 0.83              # optional, empirical coverage of the 80% PI
  baseline_crps: 0.88            # optional: seasonal-naive baseline, same splits
  baseline_crps_by_horizon: [0.55, 0.71, 0.88]   # optional

# Optional: machine figures, recorded on whatever ran the evaluation and not
# normalised — treat them as an order of magnitude.
resources:
  wall_seconds: 56.61
  cpu_seconds: 22.05
  peak_memory_mb: 2061.8
```

Skill on a model's detail page is derived, never stored:
`1 − crps / baseline_crps`, only where the file carries the baseline.

## Benchmarks

The benchmarks page groups this store by dataset: each dataset with at least one
file becomes a suite section, listing its recorded runs ranked by normalised
CRPS and every other listed model as an explicitly empty "not run" row. A
score belongs to a commit — re-evaluating a different pin adds a row, it
never updates an existing one.
