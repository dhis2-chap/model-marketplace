import type { Metadata } from "next";
import { CheckIcon, GitHubMark } from "@/components/icons";
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

const CHECKLIST = [
  "The commit hash is a real, pushed, immutable commit — not a branch name.",
  "Declared covariates match what the code actually reads.",
  "The model runs end-to-end on at least one CHAP reference dataset.",
  "A Dockerfile or environment spec is present and builds from a clean checkout.",
  "Forecast output follows the CHAP quantile schema.",
  "A maintainer is named and reachable for future version reviews.",
];

export default function ContributePage() {
  const registry = getRegistry();
  const approvals = registry.index.review_policy.required_approvals;
  return (
    <>
      <section className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-[1240px] px-8 py-14">
          <div className="font-brand text-[10px] font-medium uppercase tracking-[0.12em] text-brand">
            Contribute a model
          </div>
          <h1 className="my-3.5 max-w-[24ch] font-brand text-[32px] font-medium leading-[1.08] tracking-[-0.02em] text-ink md:text-[42px]">
            Getting listed is a pull request and three reviews
          </h1>
          <p className="max-w-[70ch] text-[16px] leading-[1.65] text-ink-2">
            The marketplace is a git repository. You add one YAML file
            describing your model and pinning a commit; {approvals} CHAP
            maintainers review it; the merge is the listing. Nothing else
            grants access — there is no upload form and no account to create.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-8 pt-12">
        <h2 className="mb-[22px] font-brand text-[20px] font-medium text-ink">
          The review pipeline
        </h2>
        <ReviewPipeline />
      </section>

      <section className="mx-auto grid max-w-[1240px] items-start gap-10 px-8 py-12 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <h2 className="mb-1.5 font-brand text-[20px] font-medium text-ink">
            The model YAML file
          </h2>
          <p className="mb-5 max-w-[76ch] text-[13.5px] text-ink-2">
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
          <div className="overflow-hidden rounded-lg border border-line">
            <div className="flex items-center justify-between gap-4 border-b border-line bg-surface-2 px-4 py-3">
              <span className="font-mono text-[12px] text-ink-2">
                models/my_model.yaml
              </span>
              <CopyButton text={EXAMPLE_YAML} label="Copy file" />
            </div>
            <CodePanel code={EXAMPLE_YAML} gutterWidth={18} />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-verified bg-verified-tint p-5">
            <div className="mb-2.5 font-brand text-[10.5px] font-medium uppercase tracking-[0.1em] text-verified">
              The three-approval rule
            </div>
            <p className="text-[13.5px] leading-[1.65] text-ink">
              A PR merges only with approving reviews from {approvals}{" "}
              maintainers on the CHAP review board. Reviewers check that the
              commit builds, the declared covariates match the code, and the
              model runs end-to-end on a reference dataset. The merge to main
              is the verification — nothing on this site got here any other
              way.
            </p>
          </div>
          <div className="rounded-lg border border-line p-5">
            <Kicker className="mb-3">Before you open the PR</Kicker>
            {CHECKLIST.map((item) => (
              <div key={item} className="grid grid-cols-[auto_1fr] gap-2.5 py-[7px]">
                <CheckIcon className="mt-[3px] h-3.5 w-3.5 text-verified" />
                <span className="text-[13px] leading-[1.55] text-ink-2">
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-surface-2 p-5">
            <Kicker className="mb-3">Promotion to Stable</Kicker>
            <p className="text-[13px] leading-relaxed text-ink-2">
              Models enter as{" "}
              <strong className="font-bold text-exp">Experimental</strong>.
              Once a model has a benchmark record on the reference datasets and
              a maintainer commitment for updates, the board may promote it to{" "}
              <strong className="font-bold text-verified">Stable</strong>.
            </p>
          </div>
          <a
            href="https://github.com/dhis2-chap"
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-[4px] bg-brand font-brand text-[14px] font-bold text-white transition-colors hover:bg-brand-dark"
          >
            <GitHubMark className="h-[15px] w-[15px]" />
            Open a pull request
          </a>
        </div>
      </section>
    </>
  );
}
