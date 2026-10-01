/**
 * Who made a model, from the model YAML's `attribution`. Maintainers are
 * the people who keep the listing working — not authors — so they are
 * named separately on the model page and never shown beside the credit.
 */

/** Compact credit for the catalog card. */
export function AuthorLine({
  author,
  organization,
}: {
  author: string;
  organization: string | null;
}) {
  return (
    <div className="min-w-0 leading-tight">
      <div className="text-[14px] font-medium text-ink">
        <span className="font-normal text-ink-2">By </span>
        {author}
      </div>
      {organization ? (
        <div className="truncate text-[13px] text-ink-2">{organization}</div>
      ) : null}
    </div>
  );
}

/** The model page's author panel. */
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
      aria-label="Author"
      className="d2-card p-5"
    >
      <div className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-3">
        Author
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
        <div className="mt-4 border-t border-line pt-4">
          <div className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Maintainers
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {maintainers.map((h) => (
              <li key={h}>
                <a
                  href={`https://github.com/${h}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[14px] text-ink-2 hover:text-brand"
                >
                  @{h}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
