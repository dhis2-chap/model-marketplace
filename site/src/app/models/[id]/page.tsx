import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MaturityBadge, VerifiedChip } from "@/components/badges";
import { CopyButton } from "@/components/copy";
import { GitHubMark } from "@/components/icons";
import { ModelDetailTabs } from "@/components/ModelDetailTabs";
import { getBenchmarks } from "@/lib/benchmarks";
import { getProposals } from "@/lib/proposals";
import { getModel, getRegistry } from "@/lib/registry";
import { toDetailView, type ChannelView } from "@/lib/views";

export function generateStaticParams() {
  return getRegistry().models.map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const model = getModel((await params).id);
  if (!model) return {};
  return { title: model.display_name, description: model.summary };
}

function PinPanel({
  channel,
  note,
  verifiedTone,
}: {
  channel: ChannelView;
  note: string;
  verifiedTone: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[3px] border ${
        verifiedTone ? "border-verified" : "border-line-strong"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b px-3 py-2 ${
          verifiedTone
            ? "border-verified bg-verified-tint"
            : "border-line bg-surface-3"
        }`}
      >
        <span className="flex items-baseline gap-2">
          <span
            className={`font-mono text-[12px] font-bold ${
              verifiedTone ? "text-verified" : "text-ink-2"
            }`}
          >
            {channel.channel}
          </span>
          <span className={`text-[11px] ${verifiedTone ? "text-ink-2" : "text-ink-3"}`}>
            {note}
          </span>
        </span>
        <span
          className={`font-brand text-[10px] font-medium uppercase tracking-[0.06em] ${
            verifiedTone ? "text-verified" : "text-ink-3"
          }`}
        >
          {channel.tag}
        </span>
      </div>
      <div className="flex items-center gap-2 bg-surface px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink">
          {channel.pinDisplay}
        </span>
        <CopyButton
          text={channel.pinFull}
          accent={verifiedTone ? "verified" : "brand"}
        />
      </div>
    </div>
  );
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();
  const registry = getRegistry();
  const proposals = await getProposals(registry);
  const view = toDetailView(model, registry, getBenchmarks(), proposals);

  const latestNote = view.latestSameAsStable
    ? "currently the same as stable"
    : view.latest.status === "verified"
      ? "newest pin"
      : "unreviewed — evaluation only";

  const header = (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
        <Link href="/" className="text-brand hover:text-brand-dark hover:underline">
          Models
        </Link>
        <span>/</span>
        <span>{view.maturity === "stable" ? "Stable set" : "Experimental set"}</span>
        <span>/</span>
        <span className="text-ink-2">{view.name}</span>
      </div>
      <div className="grid items-start gap-7 pb-[22px] lg:grid-cols-[1fr_auto] lg:gap-10">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="font-brand text-[clamp(26px,5vw,40px)] font-extrabold leading-[1.02] tracking-[-0.025em] text-ink">
              {view.name}
            </h1>
            <MaturityBadge maturity={view.maturity} size="md" suffix=" set" />
            <VerifiedChip approvals="3/3" />
          </div>
          <p className="mb-3.5 max-w-[64ch] font-serif text-[16px] leading-[1.65] text-ink-2">
            {view.summary}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-2">
            <span>
              Maintained by{" "}
              <strong className="text-ink">
                {view.maintainers.length > 0
                  ? view.maintainers.join(", ")
                  : view.org}
              </strong>
            </span>
            <a
              href={view.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-1.5 text-brand hover:text-brand-dark hover:underline"
            >
              <GitHubMark className="h-[13px] w-[13px] shrink-0" />
              <span className="font-mono text-[12px] [overflow-wrap:anywhere]">
                {view.repo}
              </span>
            </a>
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2.5 lg:min-w-[400px] lg:max-w-[440px]">
          <PinPanel
            channel={view.stable}
            note="newest verified pin — run this in production"
            verifiedTone
          />
          <PinPanel channel={view.latest} note={latestNote} verifiedTone={false} />
        </div>
      </div>
    </>
  );

  return <ModelDetailTabs view={view} header={header} />;
}
