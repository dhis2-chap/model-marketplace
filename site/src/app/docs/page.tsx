import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Marketplace reference material and direct links to the CHAP modeling documentation.",
};

const ENTRIES = [
  {
    kicker: "marketplace",
    title: "Model registry format",
    body: "The marketplace YAML schema, version pins, channels, configurations, and review conventions.",
    href: "https://github.com/dhis2-chap/model-marketplace/blob/main/models/README.md",
  },
  {
    kicker: "marketplace",
    title: "Benchmark records",
    body: "How benchmark results are produced, stored, validated, ranked, and rendered by the marketplace.",
    href: "https://github.com/dhis2-chap/model-marketplace/blob/main/benchmarks/README.md",
  },
  {
    kicker: "platform",
    title: "Run chapkit models in CHAP",
    body: "Start a pinned model service and point chap at it — how CHAP talks to chapkit services over HTTP, including the data format.",
    href: "https://chap.dhis2.org/chap-modeling-platform/external_models/chapkit/",
  },
  {
    kicker: "platform",
    title: "DHIS2 CHAP app",
    body: "Evaluate, predict, configure, and compare models from the DHIS2 Modeling App.",
    href: "https://chap.dhis2.org/chap-modeling-platform/modeling-app/using-the-modeling-app/getting-started/",
  },
  {
    kicker: "chapkit",
    title: "Build a model with chapkit",
    body: "Config, artifact and train/predict workflows for model services — the toolkit every listed model is built with.",
    href: "https://dhis2-chap.github.io/chapkit/",
  },
  {
    kicker: "community",
    title: "Get in touch",
    body: "Questions about listing a model, or joining the review board.",
    href: "mailto:climate@dhis2.org",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-[1240px] px-5 sm:px-8 pb-24 pt-16">
      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.45fr)]">
        <div>
          <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand">
            Reference
          </div>
          <h1 className="mb-5 font-brand text-[clamp(34px,3.6vw,46px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
            Documentation
          </h1>
          <p className="max-w-[44ch] font-serif text-[16px] leading-[1.7] text-ink-2">
            Marketplace formats are documented in this repository. The index
            links directly to the relevant CHAP and chapkit guides for running
            model services, building your own, and working in the DHIS2
            Modeling App. Only models built with chapkit are supported for now.
          </p>
        </div>
        <div className="border-t-2 border-ink">
          {ENTRIES.map((entry) => (
            <a
              key={entry.title}
              href={entry.href}
              target={entry.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="group grid grid-cols-[92px_minmax(0,1fr)_auto] items-start gap-x-6 border-b border-line px-4 py-[22px] transition-colors duration-150 hover:bg-surface hover:[box-shadow:inset_2px_0_0_var(--mp-brand)] max-sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <span className="pt-[3px] font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 max-sm:col-span-2 max-sm:pb-1.5">
                {entry.kicker}
              </span>
              <span className="min-w-0">
                <span className="block font-brand text-[17px] font-bold tracking-[-0.01em] text-ink transition-colors group-hover:text-brand">
                  {entry.title}
                </span>
                <span className="mt-1 block max-w-[62ch] font-serif text-[13.5px] leading-[1.6] text-ink-2">
                  {entry.body}
                </span>
              </span>
              <span className="self-center pl-4 font-brand text-[15px] text-ink-3 transition-[color,transform] duration-150 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:text-brand">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
