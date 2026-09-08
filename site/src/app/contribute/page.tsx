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
const EXAMPLE_YAML = `schema_version: 1

id: my_model
display_name: My Model
maturity: experimental        # new models always enter here

summary: >-
  What the model is and when to use it.

source:
  repository: https://github.com/org/my_model

maintainers: [your-github-handle]

compatibility:
  period_types: [monthly]

covariates:
  required: [population]      # supplied automatically by chap
  additional_continuous: [rainfall]

channels:
  stable: v1                  # must point at a verified version
  latest: v1

versions:
  - version: v1
    commit: 1111111111111111111111111111111111111111
    status: verified          # set by maintainers on approval
    verified_by: []           # the three approving maintainers
    changelog: First submission.

configurations:
  monthly:
    description: When to use this configuration.
    user_option_values:
      some_option: 12
    additional_continuous_covariates: [rainfall]
`;

const SUBMISSION_CHECKS = [
  {
    title: "Pin the exact revision",
    body: "Use the full 40-character commit SHA, already pushed to the model repository.",
  },
  {
    title: "Run it with chapkit",
    body: "Only chapkit-run models are listed — the pinned commit must serve as a chapkit model service: an MLproject repository started with chapkit mlproject run, or a scaffolded chapkit service.",
  },
  {
    title: "Describe the inputs",
    body: "List the required and optional covariates the model actually reads.",
  },
  {
    title: "Show one complete run",
    body: "Serve the pinned revision with chapkit and run chap eval against it with at least one CHAP reference dataset.",
  },
  {
    title: "Check the forecast output",
    body: "Predict must write the output chapkit expects: the index columns plus sample_0, sample_1, … forecast sample columns.",
  },
  {
    title: "Name a maintainer",
    body: "Add a GitHub handle for someone who can answer questions and review future updates.",
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
            describing your model and pinning a commit; {approvals} CHAP
            maintainers review it; the merge is the listing. Nothing else
            grants access — there is no upload form and no account to create.
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
            Adding a version is a second, smaller PR appending to{" "}
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
              {approvals} CHAP maintainers review the pinned code and the model
              YAML. Once they approve and the PR merges, the model is listed as{" "}
              <strong className="font-bold text-exp">Experimental</strong> with
              its first verified version.
            </p>
            <div className="my-4 border-t border-line" />
            <p className="font-serif text-[13.5px] leading-[1.65] text-ink-2">
              A model can move to{" "}
              <strong className="font-bold text-verified">Stable</strong> after
              benchmark results have been recorded on the reference datasets
              and an active maintainer is committed to keeping it current.
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
