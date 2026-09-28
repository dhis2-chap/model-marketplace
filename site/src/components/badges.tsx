import { SealIcon } from "./icons";
import { ASSESSED_STATUS_COPY } from "@/lib/presentation";
import type { AssessedStatus, ModelKind } from "@/lib/schema";

/**
 * Template marker. A template is scaffolding to copy when writing a model,
 * not something to forecast with — dashed border, everywhere. Models get no
 * badge at all: the catalog tabs already carry that axis, and a word printed
 * on five of seven listings only crowds out the signals that vary.
 */
export function KindBadge({ kind }: { kind: ModelKind }) {
  if (kind === "model") return null;
  return (
    <span className="inline-block shrink-0 rounded-[2px] border border-dashed border-exp bg-exp-tint px-2 py-0.5 text-[13px] font-bold text-exp">
      Template
    </span>
  );
}

/**
 * The author's own chapkit AssessedStatus. Deliberately not styled like the
 * verified seal: this is the model author's confidence in their forecasts,
 * not the marketplace's verification of the pin.
 */
const ASSESSED_TONE: Record<AssessedStatus, string> = {
  green: "border-as-green bg-as-green-tint text-as-green",
  yellow: "border-as-yellow bg-as-yellow-tint text-as-yellow",
  orange: "border-as-orange bg-as-orange-tint text-as-orange",
  red: "border-as-red bg-as-red-tint text-as-red",
  gray: "border-as-gray bg-as-gray-tint text-as-gray",
};

const ASSESSED_DOT: Record<AssessedStatus, string> = {
  green: "bg-as-green",
  yellow: "bg-as-yellow",
  orange: "bg-as-orange",
  red: "bg-as-red",
  gray: "bg-as-gray",
};

export function AssessedStatusBadge({
  status,
  size = "sm",
  showLabel = true,
}: {
  status: AssessedStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const copy = ASSESSED_STATUS_COPY[status];
  return (
    <span
      title={`Author-assessed: ${copy.label} — ${copy.blurb}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-[2px] border font-brand font-bold ${
        size === "md" ? "px-2.5 py-1 text-[14px]" : "px-2 py-0.5 text-[13px]"
      } ${ASSESSED_TONE[status]}`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${ASSESSED_DOT[status]}`}
      />
      {showLabel ? copy.label : status}
    </span>
  );
}

/** Solid green chip on the model detail header. */
export function VerifiedChip({ approvals }: { approvals: string }) {
  return (
    <span
      title="The marketplace review gate: three maintainers approved this pin. It says nothing about forecast quality — that is the author-assessed status."
      className="inline-flex items-center gap-1.5 rounded-[2px] bg-verified px-2.5 py-1 text-[14px] font-bold text-white"
    >
      <SealIcon className="h-3.5 w-3.5" knockout="var(--mp-verified)" />
      Verified by {approvals} maintainers
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "verified"
      ? "border border-solid border-verified bg-verified-tint text-verified"
      : status === "unstable" || status === "in review"
        ? "border border-dashed border-exp bg-exp-tint text-exp"
        : "border border-solid border-line bg-surface-3 text-ink-3";
  return (
    <span
      className={`inline-block rounded-[2px] px-2 py-0.5 text-[13px] font-bold ${tone}`}
    >
      {status}
    </span>
  );
}

export function ChannelChip({ channel }: { channel: "stable" | "latest" }) {
  return channel === "stable" ? (
    <span className="inline-block rounded-[2px] bg-verified px-1.5 py-0.5 text-[12px] font-bold text-white">
      stable
    </span>
  ) : (
    <span className="inline-block rounded-[2px] border border-brand px-1.5 py-px text-[12px] font-bold text-brand">
      latest
    </span>
  );
}

export function SoonPill({ label = "soon" }: { label?: string }) {
  return (
    <span className="inline-block rounded-full border border-line-strong px-1.5 py-px text-[11px] font-bold text-ink-2">
      {label}
    </span>
  );
}
