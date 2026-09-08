# CHAP Model Marketplace

A curated, verified catalog of forecasting models for [CHAP](https://chap.dhis2.org),
the Climate & Health Analytics Platform. **This repository is the marketplace**:
the YAML files at the root are the source of truth, and the website is a
rendering of them.

Nothing is listed without a pull request approved by three CHAP maintainers —
the merge to `main` is the verification. The same gate applies to every new
version pin, so a `stable` channel pointer is always a reviewed commit.

That verification is about the **pin**, not the forecast: it says a revision
is what it claims to be and runs as a chapkit service. What each model's own
authors will vouch for is a separate axis, carried per model as
`assessed_status` (chapkit's `AssessedStatus`) and surfaced separately by the
site. No listed model is currently self-assessed `green`.

## Layout

```
registry.yaml       Marketplace index: metadata, review policy, model list
models/*.yaml       One file per whitelisted model (see models/README.md)
benchmarks/         Real evaluation output, one file per model + version +
                    dataset (see benchmarks/README.md)
site/               The marketplace website (Next.js, TypeScript, pnpm)
```

## The registry

Every listed model is a [chapkit](https://dhis2-chap.github.io/chapkit/) 2.0.0
ML service. A version pin therefore has two halves of one revision: a
`repository URL + full commit hash` for reading the code, and a published
image at `<image>:sha-<short commit>` for running it. The schema cross-checks
the two, so they cannot drift; `:latest` moves and is never a pin.

Channels (`stable` / `latest`) are named pointers into the version list;
`channels.stable` must point at a version with `status: verified`. Files also
declare `kind` — a forecasting `model`, or a `template` for authors to copy —
and the format is documented with an annotated example in
[models/README.md](models/README.md).

### Listed models

| Model | `assessed_status` | Framework | Horizon |
|---|---|---|---|
| [CHAP-EWARS](models/chapkit_ewars_model.yaml) | orange | R · INLA | 0–100 |
| [GHRmodel](models/chapkit_ghr_model.yaml) | red | R · INLA (GHRmodel) | 1–12 |
| [Rwanda Malaria BYM](models/chapkit_rwanda_malaria_bym_model.yaml) | gray | R · INLA | 1–24 |
| [Simple Multistep](models/chapkit_simple_multistep_model.yaml) | orange | Python · scikit-learn + skpro | 1–100 |
| [Auto-ARIMA](models/auto_arima_chapkit.yaml) | red | R · fable | 0–12 |

Templates — scaffolding, not forecasting models:

| Template | `assessed_status` | Framework |
|---|---|---|
| [Minimalist Example (Python)](models/chapkit_minimalist_example_py.yaml) | red | Python · scikit-learn |
| [Minimalist Example (R)](models/chapkit_minimalist_example_r.yaml) | red | R · `lm()` |

## The site

```bash
cd site
pnpm install
pnpm dev        # http://localhost:3000
```

The site is fully static: at build time it loads the YAML (registry, models
and benchmarks) through a zod schema (`site/src/lib/schema.ts`) and
prerenders every page, so an invalid file fails the build.

The build also ingests this repo's **open pull requests** (via the GitHub
API) so an in-review model or version pin appears on the site as an
experimental, non-verified pin with its running approval count (n/3) — on
the model's Versions tab and in an "In review" strip on the catalog. The
registry stays the only hard gate: if GitHub is unreachable the build logs a
warning and continues without in-review pins, and the rendered PR state is
only as fresh as the last build (labeled as such in the UI). `GITHUB_TOKEN`
is used when set; `MARKETPLACE_SKIP_PR_INGEST=1` skips ingestion entirely.

Other scripts, all run from `site/`:

```bash
pnpm validate   # check registry.yaml + models/*.yaml against the schema
pnpm test       # loader + schema unit tests (vitest)
pnpm typecheck  # tsc --noEmit
pnpm build      # production build (also implies validation)
```

**Deploying on Vercel**: set the project's Root Directory to `site`
(the loader reads `../registry.yaml`; files outside the root directory are
available at build time by default).

### Honest-data rules

- Everything rendered from the YAML is real: models, pins, channels,
  configurations, maintainers — and benchmark results present in
  `benchmarks/`.
- There are no mock benchmark figures anywhere. A model with no real results
  shows no scores at all — not an illustrative sparkline, not a placeholder
  number. The benchmarks page and each model's Benchmarks tab render only
  from files in `benchmarks/`.
- `assessed_status` is transcribed from each service's own chapkit metadata
  and shown as the authors' claim, never as a marketplace grade. The two
  signals are never merged into one badge.
- In-review pins come from real open PRs at build time and are labeled with
  the build timestamp; the site never invents proposals.
- Presentation-only metadata the schema doesn't carry yet (framework labels,
  covariate-mode grouping) lives in `site/src/lib/presentation.ts` and is a
  candidate for a future `schema_version` bump.

## Benchmarking

The benchmark views on the site (the benchmarks page and each model's
Benchmarks tab) are gated behind a "coming soon" state until real results
exist — flip `BENCHMARKS_LIVE` in `site/src/lib/flags.ts` when they land.

No benchmarks have been run yet, and exactly how the comparison will be run —
harness, datasets, backtest parameters, ranking — is still being decided. The
methodology will be documented in the [benchmark record
documentation](benchmarks/README.md) once it is settled and the first suite
has run. For the underlying evaluation command, see the CHAP guide to
[evaluating models](https://chap.dhis2.org/chap-modeling-platform/external_models/running_models_in_chap/).

Until a suite has run, the only quality signal on the site is each model's
author-assessed status — which is why it is labelled as the authors' own
claim everywhere it appears.
