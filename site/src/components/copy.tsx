"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { CopyGlyph } from "./icons";

/** Clipboard write with the design's 1600 ms "Copied" swap. */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1600);
  };
  return { copied, copy };
}

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  size = "sm",
  accent = "brand",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  size?: "sm" | "md";
  accent?: "brand" | "verified";
}) {
  const { copied, copy } = useCopy();
  const hover =
    accent === "verified"
      ? "hover:border-verified hover:text-verified"
      : "hover:border-brand hover:text-brand";
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 border border-line-strong bg-transparent font-brand font-medium text-ink-2 transition-colors ${hover} ${
        size === "md"
          ? "h-8 rounded-[4px] px-3 text-[12px]"
          : "h-7 rounded-[3px] px-2.5 text-[11.5px]"
      }`}
    >
      <CopyGlyph className="h-3 w-3" />
      {copied === text ? copiedLabel : label}
    </button>
  );
}

/** Copyable monospace commit-pin chip. */
export function PinChip({
  display,
  copyText,
  variant = "card",
}: {
  display: string;
  copyText: string;
  variant?: "card" | "table";
}) {
  const { copied, copy } = useCopy();
  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void copy(copyText);
  };
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        title="Copy pin"
        className={`cursor-pointer rounded-[3px] border font-mono transition-colors hover:border-brand hover:text-brand ${
          variant === "card"
            ? "min-w-0 max-w-full truncate border-line-strong bg-surface px-[7px] py-[3px] text-[11.5px] text-ink"
            : "border-line bg-surface-2 px-2 py-[5px] text-[12.5px] text-ink [overflow-wrap:anywhere] text-left"
        }`}
      >
        {display}
      </button>
      {copied === copyText ? (
        <span className="text-[11px] text-verified">copied</span>
      ) : null}
    </span>
  );
}
