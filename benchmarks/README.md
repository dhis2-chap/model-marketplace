# Benchmark results

Benchmark results are not stored in this repository. They are read from
Chap's benchmarking server — a chap instance that backtests models on a cron
— each time the site is deployed, and baked into the build. The site never
talks to the server at runtime.

## How results reach the site

The deploy workflow (`.github/workflows/deploy.yml`) runs on every push to
`main`, every hour and on manual dispatch. Before the build it runs
`pnpm fetch-benchmarks` (`site/scripts/fetch-benchmarks.ts`), which:

1. looks up each suite in `SUITES` (`site/src/lib/chap-api.ts`) on
   `GET /v1/crud/backtest-specifications`, by its dataset and backtest
   parameters (`nPeriods`, `nSplits`, `stride`, `nRetrain`) — a specification
   has no stable name, so no specification id is stored here;
2. reads that specification's backtests from
   `GET /v1/crud/backtest-specifications/{id}`;
3. keeps the newest backtest per configured model that belongs to a listed
   pin — its model template is a listed model's `service_id`, its
   `sourceDigest` is one of that model's pinned commits and the configured
   model is one of its configurations — and drops every other backtest;
4. writes the records to the gitignored `benchmarks/results.json`, which the
   build validates against the registry and renders.

Any failure — no token, an unreachable server, a suite that does not resolve
to exactly one specification, a record the registry rejects — fails the
deploy, so a stale or empty leaderboard is never shipped in place of the real
one. Builds without the file (CI, local dev) render no results.

The server's API is gated by a single `CHAP_API_TOKEN` that can write as well
as read. It is a repository secret used only by the deploy workflow, which
never runs on pull requests. If it leaks, rotate it on the server and update
the secret.

To fetch locally:

```bash
cd site
CHAP_API_URL=http://158.37.66.207:8000 CHAP_API_TOKEN=... pnpm fetch-benchmarks
```

## Record mapping

| Record field            | From the backtest                             |
| ----------------------- | --------------------------------------------- |
| `model`, `version`      | the listed pin `modelTemplate` resolves to    |
| `commit`                | `configuredModel.modelTemplate.sourceDigest`  |
| `run.configuration`     | `configuredModel.name`                        |
| `run.horizon`, `splits` | the specification's `nPeriods`, `nSplits`     |
| `evaluated_at`          | `created`                                     |
| `harness.tool`          | `chap <chapVersion>`                          |
| `metrics.crps`          | `aggregateMetrics.crps`                       |
| `metrics.norm_crps`     | `aggregateMetrics.crps_norm`                  |
| `metrics.mae`, `rmse`   | `aggregateMetrics.mae`, `rmse`                |
| `metrics.coverage_80`   | `aggregateMetrics.coverage_10_90`             |

A backtest whose metric computation failed (no `crps`) is skipped.

## Methodology — added soon

Which suites the marketplace ranks on, and how, is not settled yet; a full
methodology description will be added here. Until then the site's benchmark
views stay behind `BENCHMARKS_LIVE` in `site/src/lib/flags.ts`.
