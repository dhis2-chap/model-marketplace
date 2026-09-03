# Design prompt — CHAP Model Marketplace

Design a **model marketplace website for [CHAP](https://chap.dhis2.org/)**
(Climate & Health Analytics Platform, by DHIS2) — a curated, verified catalog of
epidemiological forecasting models. Think "npm meets Hugging Face, but for
climate-health disease forecasting, curated by a review board." The site is a
rendering of a git repository of YAML files (the repo is the source of truth
and the review gate), so every page is content-driven: no auth, no user
accounts, no server state.

## Audience & feel

Epidemiologists, ministry-of-health analysts, and model developers/
researchers. The design must radiate **scientific trust and curation** —
these are whitelisted, maintainer-verified models, not an open bazaar. Clean,
confident, data-forward. WOW factor welcome: a distinctive hero, tasteful
motion, beautiful charts — but never at the cost of information density. Feel
adjacent to the DHIS2 world (calm blues, generous whitespace) without copying
it; give it its own identity. Light mode primary, dark mode worth designing.
Monospace accents for anything git/CLI-shaped (commit pins, YAML, terminal
snippets) — the audience lives in notebooks and terminals, lean into that.

## Core domain concepts to make visible

- **Verified badge**: every model and every version pin was reviewed and
  approved by three CHAP maintainers. This is the product's superpower —
  make verification a first-class visual element (badge showing 3/3
  approvals, reviewer avatars, "review gate" language).
- **Sets**: models are browsed per set — **Stable** and **Experimental**.
  Distinct, instantly readable badges/tints for each.
- **Version channels**: each model has channel pointers — `stable` (newest
  verified pin, what production instances should run) and `latest` (newest
  pin of any status, may be unreviewed). Show both, visually distinct.
- **Version pin**: a model version is a GitHub repo URL + `@commit` hash
  (e.g. `github.com/dhis2-chap/ewars_template@cdd06ed`). Render pins as
  copyable monospace chips with a copy button.

## Screens to design

### 1. Catalog (home)

- Hero: name the product, one line on what it is ("Verified forecasting
  models for climate & health"), a search field, and a stat row (models
  listed, verified versions, maintainer reviews). A subtle animated motif —
  e.g. an abstract ensemble-of-forecasts line chart or a network of models —
  would be the WOW moment.
- Browsable card grid, grouped or filterable by set (Stable / Experimental),
  plus filters for period type (monthly/weekly), covariate needs
  (climate-driven vs self-history only), and framework.
- Each card: display name, maturity badge, one-line summary, stable-channel
  version + short commit, covariate tags, GitHub link, and a small mock
  benchmark sparkline.

### 2. Model detail page

Header: display name, maturity badge, verified badge, maintainer org, GitHub
link, and the two channel chips (`stable` / `latest`) with copyable pins.
Sections/tabs:

- **Overview** — description, covariates (required = auto-supplied by chap
  vs additional), compatibility (period type, max forecast horizon).
- **Versions** — the version overview: a timeline/table of versions, each
  with commit pin, status (verified / unstable / deprecated), the three
  approving maintainers, and an expandable changelog entry. Make the
  stable-channel row unmistakable.
- **Configurations** — verified, copy-pasteable YAML configuration blocks
  (syntax-highlighted code panels with copy buttons) each with a short
  "when to use this" description.
- **Benchmarks** — charts backed by reviewed records in
  [`benchmarks/`](../benchmarks/README.md): CRPS by forecast horizon (line),
  model-vs-model comparison on a dataset (grouped bars), and per-country
  performance. The cross-model benchmarks show the controlled `chap bench`
  suites and links each score to its pinned model version.
- **Install** — "Add to your CHAP instance": a short step panel that shows the
  pin to copy and links to the CHAP guide for
  [evaluating external models](https://chap.dhis2.org/chap-modeling-platform/external_models/running_models_in_chap/).
  Design it as a
  terminal-flavored panel so it can later become the real marketplace
  install flow without a redesign.

### 3. Contribute page

How to get a model listed: open a PR against the marketplace repo adding a
model YAML file (repo URL + pinned commit + metadata), then **three
maintainers must approve** before it merges. Design this as a visual
pipeline: *Submit PR → 3 maintainer reviews → merged = listed → promoted
Experimental → Stable*. Include a compact annotated example of the model
YAML file.

## Real content to use in mockups

Use these five real models (mock the benchmark numbers only):

- **EWARS** (`dhis2-chap/ewars_template`) — Stable — Bayesian early-warning
  template fitted with INLA; climate covariates. Stable channel: `v6`
  `@cdd06ed`.
- **CHAP PyMC** (`dhis2-chap/chap_pymc`) — Stable — Bayesian PyMC model,
  HMC or ADVI fits. Stable channel: `uv` `@cce2e8c`.
- **AutoRegressive Monthly v2** (`chap-models/auto_regressive_monthly_v2`)
  — Stable — GRU neural-network ensemble, max horizon 3. Stable channel:
  `stable` `@d4d6b78`.
- **MSTL + AutoARIMA** (`chap-models/mstl_arima`) — Experimental — takes no
  covariates; the information-diverse ensemble member. Stable channel: `v1`
  `@6cdec6f`.
- **MSTL Multistep** (`knutdrand/mstl_multistep_model`) — Experimental —
  MSTL + ARIMA with RandomForest correction; climate-driven or
  self-history-only. Stable channel: `v1` `@c817483`.

## Deliverables

Desktop artboards for Catalog, Model detail (Versions section visible), and
Contribute; one mobile variant of the Catalog. Implementation target is a
TypeScript web app (pnpm, deployed on Vercel), so favor a componentized
design: cards, badges, chips, code panels, chart panels as a reusable system.
