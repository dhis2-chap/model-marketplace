# Benchmark store (schema_version 1)

Real evaluation output, one YAML file per **(model, version, dataset)**
triple. Results land here the same way everything else does — as a pull
request — so a benchmark number on the site is as reviewable as the pin it
describes.

The site loads this directory at build time through the same zod gate as the
registry (`site/src/lib/schema.ts`): an invalid or inconsistent benchmark
file fails the build. Until a model has real results here, the site shows
mock fixtures labeled "mock data · illustrative"; the per-model label comes
off automatically when its first real file lands, and the leaderboard renders
once any results exist.

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
  tool: chap evaluate-ensemble   # what produced the numbers
  run: https://github.com/...    # optional: CI run / artifact with the raw output

metrics:
  crps: 0.63                     # mean CRPS over the backtest (required)
  crps_by_horizon: [0.39, 0.47, 0.58]   # optional, h1..hN
  mae: 11.8                      # optional
  coverage_80: 0.83              # optional, empirical coverage of the 80% PI
  baseline_crps: 0.88            # optional: seasonal-naive baseline, same splits
  baseline_crps_by_horizon: [0.55, 0.71, 0.88]   # optional
```

Skill on the leaderboard is derived, never stored:
`1 − crps / baseline_crps`, only where the file carries the baseline.
