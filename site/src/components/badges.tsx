import type { ReactNode } from "react";
import { SealIcon } from "./icons";
import { ASSESSED_STATUS_COPY } from "@/lib/presentation";
import type { AssessedStatus, ModelKind } from "@/lib/schema";

/**
 * Model / Template badge. A template is scaffolding to copy when writing a
 * model, not something to forecast with — dashed border, everywhere.
 */
export function KindBadge({
  kind,
  size = "sm",
}: {
  kind: ModelKind;
  size?: "sm" | "md";
}) {
  const isModel = kind === "model";
  return (
    <span
      className={`inline-block shrink-0 rounded-[2px] font-brand font-bold uppercase tracking-[0.09em] ${
        size === "md" ? "px-2 py-1 text-[10px]" : "px-[7px] py-[3px] text-[9.5px]"
      } ${
        isModel
          ? "border border-solid border-line-strong bg-surface-3 text-ink-2"
          : "border border-dashed border-exp bg-exp-tint text-exp"
      }`}
    >
      {isModel ? "Model" : "Template"}
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
        size === "md" ? "px-2 py-1 text-[10.5px]" : "px-[7px] py-[3px] text-[10px]"
      } ${ASSESSED_TONE[status]}`}
    >
      <span
        aria-hidden
        className={`h-[7px] w-[7px] shrink-0 rounded-full ${ASSESSED_DOT[status]}`}
      />
      {showLabel ? copy.label : status}
    </span>
  );
}

/** Inline "Verified 3/3" row used on cards. */
export function VerifiedInline({
  approvals,
  detail,
}: {
  approvals: string;
  detail?: ReactNode;
}) {
  return (
    <span className="flex items-center gap-2">
      <SealIcon className="h-3.5 w-3.5 shrink-0 text-verified" />
      <span className="font-brand text-[12px] font-bold text-verified">
        Verified {approvals}
      </span>
      {detail ? (
        <>
          <span className="text-ink-3">·</span>
          <span className="text-[12px] text-ink-2">{detail}</span>
        </>
      ) : null}
    </span>
  );
}

/** Solid green chip on the model detail header. */
export function VerifiedChip({ approvals }: { approvals: string }) {
  return (
    <span
      title="The marketplace review gate: three maintainers approved this pin. It says nothing about forecast quality — that is the author-assessed status."
      className="inline-flex items-center gap-1.5 rounded-[2px] bg-verified px-[9px] py-1 font-brand text-[11px] font-bold text-white"
    >
      <SealIcon className="h-3 w-3" knockout="var(--mp-verified)" />
      Pin verified {approvals}
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
      className={`inline-block rounded-[2px] px-2 py-1 font-brand text-[10px] font-bold uppercase tracking-[0.08em] ${tone}`}
    >
      {status}
    </span>
  );
}

export function ChannelChip({ channel }: { channel: "stable" | "latest" }) {
  return channel === "stable" ? (
    <span className="inline-block rounded-[2px] bg-verified px-[5px] py-[2px] font-brand text-[9px] font-bold uppercase tracking-[0.07em] text-white">
      stable
    </span>
  ) : (
    <span className="inline-block rounded-[2px] border border-brand px-[5px] py-px font-brand text-[9px] font-bold uppercase tracking-[0.07em] text-brand">
      latest
    </span>
  );
}

export function SoonPill({ label = "soon" }: { label?: string }) {
  return (
    <span className="inline-block rounded-full border border-line-strong px-1.5 py-[2px] font-brand text-[9px] font-bold uppercase tracking-[0.07em] text-ink-3">
      {label}
    </span>
  );
}

/** Small uppercase section label, set in the data voice. */
export function Kicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3 ${className}`}
    >
      {children}
    </div>
  );
}
