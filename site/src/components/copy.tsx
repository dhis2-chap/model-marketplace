"use client";

import { useEffect, useRef, useState } from "react";
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
          ? "h-9 rounded-md px-3 text-[14px]"
          : "h-8 rounded-md px-2.5 text-[13px]"
      }`}
    >
      <CopyGlyph className="h-3 w-3" />
      <span aria-live="polite">{copied === text ? copiedLabel : label}</span>
    </button>
  );
}
