import type { SVGProps } from "react";

/** DHIS2 mark; colored via currentColor so the theme swap is pure CSS. */
export function Dhis2Mark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 182" fill="currentColor" aria-hidden {...props}>
      <path d="M191.73,60,109,6.34a19.73,19.73,0,0,0-20.32,0L8.31,58.43a12,12,0,0,0-.25,20.63L88.6,134a19.37,19.37,0,0,0,20.37.25l82.76-53.65a11.88,11.88,0,0,0,0-20.59Zm-91,61.45a4.29,4.29,0,0,1-3.49-.05l-77-52.49L97,19.13a4.76,4.76,0,0,1,3.74,0L179.6,70.28Z" />
      <path d="M88.66,47.82,45.1,76.06l13.61,9.33L97,60.61a4.76,4.76,0,0,1,3.74,0l39.37,25.52,14-9.06L109,47.82A19.76,19.76,0,0,0,88.66,47.82Z" />
      <path d="M191.73,101.46l-8.62-5.59-14.05,9.06,10.53,6.83-78.91,51.15a4.37,4.37,0,0,1-3.49,0l-77-52.5,10-6.47L16.55,94.57,8.31,99.91a12,12,0,0,0-.25,20.63L88.6,175.46a19.34,19.34,0,0,0,20.37.24l82.75-53.65a11.88,11.88,0,0,0,0-20.59Z" />
    </svg>
  );
}

/** Scalloped verification seal with a knockout check. */
export function SealIcon({
  knockout = "var(--mp-surface)",
  ...props
}: SVGProps<SVGSVGElement> & { knockout?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 .8 9.9 2 12.1 1.9l.8 2.1 1.9 1.2-.6 2.1.6 2.1-1.9 1.2-.8 2.1-2.2-.1L8 15.2 6.1 14l-2.2.1-.8-2.1L1.2 10.8l.6-2.1-.6-2.1L3.1 5.4l.8-2.1L6.1 2 8 .8Z" />
      <path d="M6.9 10.6 4.6 8.3l.9-.9 1.4 1.4 3.5-3.5.9.9-4.4 4.4Z" fill={knockout} />
    </svg>
  );
}

export function MagnifierIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden
      {...props}
    >
      <circle cx={7} cy={7} r={4.5} />
      <path d="M10.5 10.5 L14 14" />
    </svg>
  );
}

export function CopyGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
      {...props}
    >
      <rect x={5.5} y={5.5} width={8} height={8} rx={1.2} />
      <path d="M10.5 3.5v-1h-8v8h1" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
      {...props}
    >
      <path d="M3 8.5 6.2 11.7 13 5" />
    </svg>
  );
}

export function GitHubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
