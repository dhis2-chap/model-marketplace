import type { CSSProperties } from "react";

/** YAML syntax highlighting, ported from the design canvas's highlight(). */

const STYLES: Record<string, CSSProperties> = {
  key: { color: "var(--mp-code-key)" },
  str: { color: "var(--mp-code-str)" },
  num: { color: "var(--mp-code-num)" },
  com: { color: "var(--mp-code-com)", fontStyle: "italic" },
  base: { color: "var(--mp-code-fg)" },
  punct: { color: "#7C8598" },
};

interface Token {
  text: string;
  kind: keyof typeof STYLES;
}

function tokenizeValue(rest: string): Token[] {
  const tokens: Token[] = [];
  for (const part of rest.split(/("[^"]*"|\b\d+(?:\.\d+)?\b)/g)) {
    if (!part) continue;
    if (/^"[^"]*"$/.test(part)) tokens.push({ text: part, kind: "str" });
    else if (/^\d+(?:\.\d+)?$/.test(part)) tokens.push({ text: part, kind: "num" });
    else if (/^(true|false|null)$/.test(part.trim()))
      tokens.push({ text: part, kind: "num" });
    else tokens.push({ text: part, kind: "base" });
  }
  return tokens;
}

function tokenizeLine(line: string): Token[] {
  if (!line.trim()) return [{ text: " ", kind: "base" }];
  let code = line;
  let comment = "";
  const hash = line.indexOf("#");
  if (hash >= 0) {
    comment = line.slice(hash);
    code = line.slice(0, hash);
  }
  const tokens: Token[] = [];
  const m = code.match(/^(\s*-?\s*)([A-Za-z0-9_.\-]+)(:)(.*)$/);
  if (m) {
    if (m[1]) tokens.push({ text: m[1], kind: "base" });
    tokens.push({ text: m[2], kind: "key" });
    tokens.push({ text: m[3], kind: "punct" });
    tokens.push(...tokenizeValue(m[4]));
  } else if (code) {
    tokens.push(...tokenizeValue(code));
  }
  if (comment) tokens.push({ text: comment, kind: "com" });
  return tokens;
}

export function CodePanel({
  code,
  gutterWidth = 16,
}: {
  code: string;
  gutterWidth?: number;
}) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className="overflow-x-auto bg-code-bg px-[18px] py-4">
      {lines.map((line, i) => (
        <div
          key={i}
          className="flex w-max min-w-full gap-4 font-mono text-[12.5px] leading-[1.75]"
        >
          <span
            className="select-none text-right"
            style={{ width: gutterWidth, color: "var(--mp-code-com)" }}
          >
            {i + 1}
          </span>
          <span className="whitespace-pre text-code-fg">
            {tokenizeLine(line).map((t, j) => (
              <span key={j} style={STYLES[t.kind]}>
                {t.text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
