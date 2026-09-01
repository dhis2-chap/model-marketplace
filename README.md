# CHAP Model Marketplace

A curated, verified catalog of forecasting models for [CHAP](https://chap.dhis2.org),
the Climate & Health Analytics Platform. **This repository is the marketplace**:
the YAML files at the root are the source of truth, and the website is a
rendering of them.

Nothing is listed without a pull request approved by three CHAP maintainers —
the merge to `main` is the verification. The same gate applies to every new
version pin, so a `stable` channel pointer is always a reviewed commit.

## Layout

```
registry.yaml       Marketplace index: metadata, review policy, model list
models/*.yaml       One file per whitelisted model (see models/README.md)
benchmarks/         Real evaluation output, one file per model + version +
                    dataset (see benchmarks/README.md)
site/               The marketplace website (Next.js, TypeScript, pnpm)
docs/               Design brief and provenance material
```

## The registry

Each model file pins versions as `repository URL + full commit hash` — the
same `url@commit` reference chap's configured-models YAML uses. Channels
(`stable` / `latest`) are named pointers into the version list;
`channels.stable` must point at a version with `status: verified`. The format
is documented with an annotated example in [models/README.md](models/README.md).

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
- A model with no real results yet falls back to **mock fixtures** in
  `site/src/lib/mock-benchmarks.ts`, labeled "mock data · illustrative" in
  the UI. The label comes off per model when its first real file lands, and
  the leaderboard renders only from real results.
- In-review pins come from real open PRs at build time and are labeled with
  the build timestamp; the site never invents proposals.
- Presentation-only metadata the schema doesn't carry yet (framework labels,
  covariate-mode grouping) lives in `site/src/lib/presentation.ts` and is a
  candidate for a future `schema_version` bump.

## Benchmarking

The current comparison is launched from chap-core with `uv` and `chap bench`
using `benchmark.yaml`. It evaluates the sequential Cartesian product of ten
pinned model configurations and three monthly admin-1 datasets (Laos, Vietnam,
and Thailand), with one repetition: 30 model–dataset evaluations in total.
Each evaluation runs in a fresh Docker container and invokes `chap eval`
against the exact pinned commit. See the [benchmark record and methodology
documentation](benchmarks/README.md) and the CHAP guide to
[evaluating models](https://chap.dhis2.org/chap-modeling-platform/external_models/running_models_in_chap/).
