import type { ReactNode } from "react";
import { SealIcon } from "./icons";

/** Stable / Experimental set badge. Dashed border = experimental, everywhere. */
export function MaturityBadge({
  maturity,
  size = "sm",
  suffix = "",
}: {
  maturity: "stable" | "experimental";
  size?: "sm" | "md";
  suffix?: string;
}) {
  const stable = maturity === "stable";
  return (
    <span
      className={`inline-block shrink-0 rounded-[3px] font-brand font-medium uppercase ${
        size === "md"
          ? "px-2 py-1 text-[10px] tracking-[0.08em]"
          : "px-[7px] py-[3px] text-[9.5px] tracking-[0.08em]"
      } ${
        stable
          ? "border border-solid border-verified bg-verified-tint text-verified"
          : "border border-dashed border-exp bg-exp-tint text-exp"
      }`}
    >
      {stable ? "Stable" : "Experimental"}
      {suffix}
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
      <span className="text-[12px] font-bold text-verified">
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
    <span className="inline-flex items-center gap-1.5 rounded-[3px] bg-verified px-[9px] py-1 font-brand text-[11px] font-medium text-white">
      <SealIcon className="h-3 w-3" knockout="var(--mp-verified)" />
      Verified {approvals}
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
      className={`inline-block rounded-[3px] px-2 py-1 font-brand text-[10px] font-medium uppercase tracking-[0.07em] ${tone}`}
    >
      {status}
    </span>
  );
}

export function ChannelChip({ channel }: { channel: "stable" | "latest" }) {
  return channel === "stable" ? (
    <span className="inline-block rounded-[2px] bg-verified px-[5px] py-[2px] font-brand text-[9px] font-medium uppercase tracking-[0.06em] text-white">
      stable
    </span>
  ) : (
    <span className="inline-block rounded-[2px] border border-brand px-[5px] py-px font-brand text-[9px] font-medium uppercase tracking-[0.06em] text-brand">
      latest
    </span>
  );
}

export function SoonPill({ label = "soon" }: { label?: string }) {
  return (
    <span className="inline-block rounded-full border border-line-strong px-1.5 py-[2px] font-brand text-[9px] font-medium uppercase tracking-[0.06em] text-ink-3">
      {label}
    </span>
  );
}

/** Amber "these numbers are fictional" flag for the benchmark mocks. */
export function MockDataChip() {
  return (
    <span className="inline-block rounded-[3px] border border-dashed border-exp bg-exp-tint px-[9px] py-[5px] font-mono text-[11px] text-exp">
      mock data · illustrative
    </span>
  );
}

/** Small uppercase section label. */
export function Kicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-brand text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-3 ${className}`}
    >
      {children}
    </div>
  );
}
