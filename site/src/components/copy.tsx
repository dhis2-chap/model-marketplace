"use client";

import { useEffect, useRef, useState } from "react";
import { IconCopy16 } from "@dhis2/ui-icons";

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

/** A DHIS2 secondary Button — small in rows, medium in panel headers. */
export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  size = "sm",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  size?: "sm" | "md";
}) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`d2-button d2-button-secondary shrink-0 ${
        size === "sm" ? "d2-button-small" : ""
      }`}
    >
      <IconCopy16 />
      <span aria-live="polite">{copied === text ? copiedLabel : label}</span>
    </button>
  );
}
