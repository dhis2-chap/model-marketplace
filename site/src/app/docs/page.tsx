import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Documentation for the marketplace catalog; everything about running models lives on the CHAP platform site.",
};

const CARDS = [
  {
    kicker: "marketplace",
    title: "How listing works",
    body: "The YAML schema, channels, sets, and what maintainers check during review.",
    href: "https://github.com/dhis2-chap",
  },
  {
    kicker: "marketplace",
    title: "Version pins & channels",
    body: "Why every version is a commit hash, and when to follow stable rather than latest.",
    href: "https://github.com/dhis2-chap",
  },
  {
    kicker: "platform",
    title: "CHAP modeling platform",
    body: "Running external models, runtime images, and the evaluation harness.",
    href: "https://chap.dhis2.org",
  },
  {
    kicker: "platform",
    title: "DHIS2 CHAP app",
    body: "Configuring forecasts inside a DHIS2 instance and reading the outputs.",
    href: "https://chap.dhis2.org",
  },
  {
    kicker: "data",
    title: "Covariate pipelines",
    body: "ERA5 climate data ingestion, org-unit population, and what chap supplies automatically.",
    href: "https://chap.dhis2.org",
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
        The marketplace documents the catalog itself. Everything about running
        models — the modeling platform, runtime images, the DHIS2 CHAP app —
        lives on the platform site.
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
