# Benchmark store (schema_version 1)

Real evaluation output, one YAML file per **(model, version, dataset)**
triple. Results land here the same way everything else does — as a pull
request — so a benchmark number on the site is as reviewable as the pin it
describes.

The site loads this directory at build time through the same zod gate as the
registry (`site/src/lib/schema.ts`): an invalid or inconsistent benchmark
file fails the build. Until a model has real results here, the site shows
mock fixtures labeled "mock data · illustrative"; the per-model label comes
off automatically when its first real file lands, and the benchmarks page renders
once any results exist.

## How the current comparison is run

The full comparison is launched with `uv` and `chap bench`, using
`benchmark.yaml` as the suite definition. The suite is a sequential Cartesian
product:

- 10 pinned model configurations
- 3 monthly admin-1 datasets: `laos-monthly`, `vietnam-monthly`, and
  `thailand-monthly`
- 1 repetition
- 30 model–dataset evaluations in total

Each evaluation gets a fresh disposable Docker container with an 8-CPU limit,
a 64 GB memory limit, a two-hour timeout, and network access for cloning the
model and preparing its dependencies. The dataset and model configuration are
mounted read-only; only that evaluation's output is writable.

Within the container, CHAP loads and validates the dataset, clones the model at
its exact 40-character commit, prepares the model environment, applies the
selected configuration, and runs `chap eval`. The backtest parameters are:

```yaml
n_periods: 3
n_splits: 12
stride: 1
n_retrain: 1
historical_context_years: 6
```

This creates 12 forecast origins one month apart. Each forecasts the next
three months, so the forecast windows overlap. The model is fitted at the first
split only; later splits receive an expanding history without fitting the
estimator again. Each location can therefore contribute up to 36 forecast
cells, excluding cells whose target observation is missing. The six years of
historical context are retained for plots and history-dependent metrics; they
do not cap the model's training data.

CHAP writes forecasts and observations to NetCDF and calculates overall,
per-horizon, and per-location metrics. `crps_norm` is the primary ranking
metric; MAE, RMSE, CRPS, interval coverage, ratio above truth, and the 10–90%
Winkler score are also recorded. Models are ranked within each dataset, then
combined by equally weighted mean dataset rank. Models with incomplete dataset
coverage are placed after models that completed all three datasets.

The portable output in `artifacts/` includes the resolved manifest, structured
run records, benchmark files, metric slices, pairwise comparisons, NetCDF
evaluations, and complete logs. It also records commands, hashes, machine
information, runtime, CPU consumption, and peak memory. Marketplace YAML is
exported only after the complete suite succeeds and passes its export checks.
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
