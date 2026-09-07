import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Marketplace reference material and direct links to the CHAP modeling documentation.",
};

const CARDS = [
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
    <main className="mx-auto max-w-[1240px] px-8 pb-24 pt-16">
      <h1 className="mb-3.5 font-brand text-[32px] font-medium tracking-[-0.02em] text-ink md:text-[40px]">
        Documentation
      </h1>
      <p className="mb-9 max-w-[70ch] text-[16px] leading-[1.65] text-ink-2">
        Marketplace formats are documented in this repository. The cards below
        link directly to the relevant CHAP and chapkit guides for running model
        services, building your own, and working in the DHIS2 Modeling App.
        Only models built with chapkit are supported for now.
      </p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <a
            key={card.title}
            href={card.href}
            target={card.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            className="block rounded-lg border border-line bg-surface p-[22px] transition-[border-color,box-shadow] hover:border-brand hover:shadow-lift"
          >
            <div className="mb-3 font-mono text-[11px] text-ink-3">
              {card.kicker}
            </div>
            <div className="mb-2 font-brand text-[16px] font-medium text-ink">
              {card.title}
            </div>
            <p className="text-[13px] leading-relaxed text-ink-2">{card.body}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
