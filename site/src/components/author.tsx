/**
 * Who made a model. The author credit comes from the model YAML's
 * `attribution`; the faces are the listing's maintainers' GitHub avatars.
 */

export function Avatar({
  handle,
  size = 28,
  ring = false,
}: {
  handle: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    // A plain <img>: GitHub already serves avatars sized, and the site is
    // static, so next/image would only add an optimisation hop.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://github.com/${handle}.png?size=${size * 2}`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={`shrink-0 rounded-full bg-surface-3 ${
        ring ? "border-2 border-surface" : ""
      }`}
    />
  );
}

export function AvatarStack({ handles }: { handles: string[] }) {
  if (handles.length === 0) return null;
  return (
    <span className="flex shrink-0 -space-x-2" aria-hidden>
      {handles.slice(0, 3).map((h) => (
        <Avatar key={h} handle={h} ring />
      ))}
    </span>
  );
}

/** Compact credit for the catalog card. */
export function AuthorLine({
  author,
  organization,
  maintainers,
}: {
  author: string;
  organization: string | null;
  maintainers: string[];
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <AvatarStack handles={maintainers} />
      <div className="min-w-0 leading-tight">
        <div className="text-[14px] font-medium text-ink">
          <span className="font-normal text-ink-2">By </span>
          {author}
        </div>
        {organization ? (
          <div className="truncate text-[13px] text-ink-2">{organization}</div>
        ) : null}
      </div>
    </div>
  );
}

/** The model page's "Submitted by" panel. */
export function AuthorPanel({
  author,
  organization,
  contact,
  maintainers,
}: {
  author: string;
  organization: string | null;
  contact: string | null;
  maintainers: string[];
}) {
  return (
    <section
      aria-label="Submitted by"
      className="d2-card p-5"
    >
      <div className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-3">
        Submitted by
      </div>
      <div className="mt-2 font-brand text-[22px] font-medium leading-tight text-ink">
        {author}
      </div>
      {organization ? (
        <div className="mt-1 text-[15px] text-ink-2">{organization}</div>
      ) : null}
      {contact ? (
        <a
          href={`mailto:${contact}`}
          className="mt-2 inline-block text-[14px] text-brand hover:underline [overflow-wrap:anywhere]"
        >
          {contact}
        </a>
      ) : null}
      {maintainers.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4">
          {maintainers.map((h) => (
            <li key={h}>
              <a
                href={`https://github.com/${h}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[14px] text-ink-2 hover:text-brand"
              >
                <Avatar handle={h} size={24} />@{h}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
