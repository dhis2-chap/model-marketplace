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

The site is fully static: at build time it loads the YAML through a zod
schema (`site/src/lib/schema.ts`) and prerenders every page, so an invalid
registry fails the build. Other scripts, all run from `site/`:

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
  configurations.
- Benchmark numbers (sparklines, CRPS charts, the blurred leaderboard) are
  **mock fixtures** in `site/src/lib/mock-benchmarks.ts`, labeled
  "mock data · illustrative" in the UI, until real evaluation output exists.
- Presentation-only metadata the schema doesn't carry yet (framework labels,
  covariate-mode grouping) lives in `site/src/lib/presentation.ts` and is a
  candidate for a future `schema_version` bump.

## Roadmap

- Ingest open PRs so an in-review model/version can appear as an
  experimental, non-verified pin showing its approval count (n/3); it becomes
  stable + verified only on merge to `main`.
- Backfill `maintainers` and `versions[].verified_by` in the model files.
- Real benchmark storage (per model id + version) and the cross-model
  leaderboard.
