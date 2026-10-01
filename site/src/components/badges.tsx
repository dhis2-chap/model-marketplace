import { SealIcon } from "./icons";
import { ASSESSED_STATUS_COPY } from "@/lib/presentation";
import type { AssessedStatus, ModelKind } from "@/lib/schema";

/*
 * Every badge here is a DHIS2 Tag (`d2-tag`, see globals.css). DHIS2 gives
 * Tag four tones — default, neutral, positive, negative — plus `bold` for
 * the few that must be seen in a dense view.
 */

/**
 * Template marker. A template is scaffolding to copy when writing a model,
 * not something to forecast with. Models get no badge at all: the catalog
 * tabs already carry that axis, and a word printed on five of seven
 * listings only crowds out the signals that vary.
 */
export function KindBadge({ kind }: { kind: ModelKind }) {
  if (kind === "model") return null;
  return <span className="d2-tag">Template</span>;
}

/**
 * The author's own chapkit AssessedStatus. Deliberately not styled like the
 * verified seal: this is the model author's confidence in their forecasts,
 * not the marketplace's verification of the pin. Five steps don't fit
 * Tag's three tones, so each step has its own tint and a coloured dot.
 */
const ASSESSED_TONE: Record<AssessedStatus, string> = {
  green: "bg-as-green-tint text-as-green",
  yellow: "bg-as-yellow-tint text-as-yellow",
  orange: "bg-as-orange-tint text-as-orange",
  red: "bg-as-red-tint text-as-red",
  gray: "bg-as-gray-tint text-as-gray",
};

const ASSESSED_DOT: Record<AssessedStatus, string> = {
  green: "bg-as-green-dot",
  yellow: "bg-as-yellow-dot",
  orange: "bg-as-orange-dot",
  red: "bg-as-red-dot",
  gray: "bg-as-gray-dot",
};

export function AssessedStatusBadge({
  status,
  showLabel = true,
}: {
  status: AssessedStatus;
  showLabel?: boolean;
}) {
  const copy = ASSESSED_STATUS_COPY[status];
  return (
    <span
      title={`Author-assessed: ${copy.label} — ${copy.blurb}`}
      className={`d2-tag ${ASSESSED_TONE[status]}`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${ASSESSED_DOT[status]}`}
      />
      {showLabel ? copy.label : status}
    </span>
  );
}

/** Bold positive Tag on the model detail header. */
export function VerifiedChip({ approvals }: { approvals: string }) {
  return (
    <span
      title="The marketplace review gate: three maintainers approved this pin. It says nothing about forecast quality — that is the author-assessed status."
      className="d2-tag d2-tag-bold d2-tag-positive"
    >
      <SealIcon className="h-3.5 w-3.5" knockout="var(--mp-verified)" />
      Verified by {approvals} maintainers
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "verified"
      ? "d2-tag-positive"
      : status === "unstable" || status === "in review"
        ? "bg-as-yellow-tint text-as-yellow"
        : "";
  return <span className={`d2-tag ${tone}`}>{status}</span>;
}

export function ChannelChip({ channel }: { channel: "stable" | "latest" }) {
  return channel === "stable" ? (
    <span className="d2-tag d2-tag-bold d2-tag-positive">stable</span>
  ) : (
    <span className="d2-tag d2-tag-neutral">latest</span>
  );
}

export function SoonPill({ label = "soon" }: { label?: string }) {
  return <span className="d2-tag">{label}</span>;
}
