import type { Metadata } from "next";
import { GitHubMark } from "@/components/icons";
import { CodePanel } from "@/components/CodePanel";
import { CopyButton } from "@/components/copy";
import { Kicker } from "@/components/badges";
import { ReviewPipeline } from "@/components/ReviewPipeline";
import { getRegistry } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "How to list a model: one YAML file, one pull request, three maintainer reviews.",
};

/** Compact version of the real schema documented in models/README.md. */
const EXAMPLE_YAML = `schema_version: 2

id: my_model
service_id: my-model          # MLServiceInfo.id — kebab-case of id
display_name: My Model
kind: model                   # model | template
assessed_status: red          # YOUR OWN chapkit AssessedStatus

summary: >-
  What the model is and when to use it.

source:
  repository: https://github.com/org/my_model
  image: ghcr.io/org/my_model                  # published, no tag
  runtime_image: ghcr.io/dhis2-chap/chapkit-py # the chapkit base

attribution:
  author: Your Name
  contact: you@example.org

maintainers: [your-github-handle]

compatibility:
  period_types: [monthly]
  min_prediction_periods: 1
  max_prediction_periods: 12
  requires_geo: false

covariates:
  required: [population]      # supplied automatically by chap
  defaults: [rainfall]        # your service's own defaults
  allow_free_additional: true

channels:
  stable: 1.0.0               # must point at a verified version
  latest: 1.0.0

versions:
  - version: 1.0.0            # your MLServiceInfo.version
    commit: 1111111111111111111111111111111111111111
    image_tag: sha-1111111    # the tag built from that commit
    chapkit: ">=2.0.0,<3"
    status: verified          # set by maintainers on approval
    verified_by: []           # the three approving maintainers
    changelog: First submission.

configurations:
  monthly:
    description: When to use this configuration.
    config:
      prediction_periods: 3
      some_option: 12
      additional_continuous_covariates: [rainfall]
`;

const SUBMISSION_CHECKS = [
  {
    title: "Build it on chapkit 2.0.0",
    body: "Only chapkit services are listed. Your model must be a chapkit ML service — an MLServiceBuilder app on one of the published chapkit base images.",
  },
  {
    title: "Publish the image",
    body: "Push to a registry with a sha-<short commit> tag alongside :latest, so a pin names one immutable revision. The scaffolded publish-docker workflow already does this.",
  },
  {
    title: "Pin the exact revision",
    body: "Use the full 40-character commit SHA, already pushed, and the image tag built from that same commit. The schema rejects the two if they disagree.",
  },
  {
    title: "Declare the contract honestly",
    body: "MLServiceInfo is what CHAP and the Modeling App show operators: required_covariates, the prediction-period bounds, requires_geo, and whether you accept free additional covariates.",
  },
  {
    title: "Assess your own model",
    body: "Set author_assessed_status to the colour that most honestly describes how far you have validated it, and pick conservatively — deployers make real decisions on this field. The marketplace copies it verbatim and never upgrades it for you.",
  },
  {
    title: "Show it registering",
    body: "Start the service from a compose overlay next to chap-core and confirm it appears in GET /v2/services, then run a train and a predict through it.",
  },
  {
    title: "Check the forecast output",
    body: "Predict must write the output chapkit expects: the index columns plus sample_0, sample_1, … forecast sample columns.",
  },
  {
    title: "Name a maintainer",
    body: "Add a GitHub handle for someone who can answer questions and review future updates — separate from the author credit in attribution.",
  },
];

export default function ContributePage() {
  const registry = getRegistry();
  const approvals = registry.index.review_policy.required_approvals;
  const repository = registry.index.marketplace.repository;
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1240px] px-5 py-11 sm:px-8 sm:py-16">
          <div className="mb-5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand">
            Contribute a model
          </div>
          <h1 className="mb-5 max-w-[20ch] font-brand text-[clamp(34px,4.2vw,54px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink [text-wrap:balance]">
            Getting listed is a pull request and three reviews
          </h1>
          <p className="max-w-[62ch] font-serif text-[17px] leading-[1.7] text-ink-2">
            The marketplace is a git repository. You add one YAML file
            describing your chapkit service and pinning a commit and its
            image; {approvals} CHAP maintainers review it; the merge is the
            listing. Nothing else grants access — there is no upload form and
            no account to create.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-12">
        <h2 className="mb-[22px] font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
          The review pipeline
        </h2>
        <ReviewPipeline />
      </section>

      <section className="mx-auto grid max-w-[1240px] items-start gap-10 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.25fr_1fr]">
        {/* min-w-0: without it the grid track sizes to the widest YAML line
            instead of letting the code panel scroll. */}
        <div className="min-w-0">
          <h2 className="mb-1.5 font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
            The model YAML file
          </h2>
          <p className="mb-5 max-w-[76ch] font-serif text-[14px] leading-[1.65] text-ink-2">
            One file per model in{" "}
            <code className="font-mono text-[12.5px] text-ink">models/</code>.
            Most of it is transcribed from your service&apos;s own{" "}
            <code className="font-mono text-[12.5px] text-ink">
              MLServiceInfo
            </code>
            . Adding a version is a second, smaller PR appending to{" "}
            <code className="font-mono text-[12.5px] text-ink">versions:</code>{" "}
            — reviewed the same way. The full format is documented in{" "}
            <code className="font-mono text-[12.5px] text-ink">
              models/README.md
            </code>
            .
          </p>
          <div className="overflow-hidden rounded-[3px] border border-line">
            <div className="flex items-center justify-between gap-4 border-b border-line bg-surface-2 px-4 py-3">
              <span className="font-mono text-[12px] text-ink-2">
                models/my_model.yaml
              </span>
              <CopyButton text={EXAMPLE_YAML} label="Copy file" />
            </div>
            <CodePanel code={EXAMPLE_YAML} gutterWidth={18} />
          </div>
        </div>
        <aside className="min-w-0">
          <div className="border-t-2 border-ink pt-5">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <h2 className="font-brand text-[22px] font-bold tracking-[-0.01em] text-ink">
                Prepare the pull request
              </h2>
              <span className="shrink-0 font-mono text-[11px] text-ink-3">
                {SUBMISSION_CHECKS.length} checks
              </span>
            </div>
            <p className="mb-5 max-w-[52ch] font-serif text-[14px] leading-[1.65] text-ink-2">
              Make the review reproducible. A maintainer should be able to
              start at the pinned commit and finish with a valid CHAP forecast.
            </p>
            <ol className="border-y border-line">
              {SUBMISSION_CHECKS.map((item, index) => (
                <li
                  key={item.title}
                  className="grid grid-cols-[24px_1fr] gap-3 border-t border-line py-3.5 first:border-t-0"
                >
                  <span className="pt-0.5 font-mono text-[10.5px] text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-brand text-[13.5px] font-bold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-[12.5px] leading-[1.55] text-ink-2">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 rounded-[3px] border border-line bg-surface px-5 py-[18px]">
            <Kicker className="mb-2.5">After you submit</Kicker>
            <p className="font-serif text-[13.5px] leading-[1.65] text-ink-2">
              {approvals} CHAP maintainers review the pinned code, the image
              and the model YAML. Once they approve and the PR merges, the pin
              is{" "}
              <strong className="font-bold text-verified">verified</strong> —
              meaning it is the revision it claims to be and runs as a chapkit
              service.
            </p>
            <div className="my-4 border-t border-line" />
            <p className="font-serif text-[13.5px] leading-[1.65] text-ink-2">
              The gate does not grade your forecasts. Your own{" "}
              <strong className="font-bold text-ink">assessed status</strong>{" "}
              stays exactly as you set it and is shown as your claim; raising
              it is a PR against your own service, not something maintainers
              do for you.
            </p>
          </div>

          <a
            href={`${repository}/compare`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[3px] bg-brand font-brand text-[14px] font-bold text-white transition-colors hover:bg-brand-dark"
          >
            <GitHubMark className="h-[15px] w-[15px]" />
            Open a pull request
          </a>
        </aside>
      </section>
    </>
  );
}
