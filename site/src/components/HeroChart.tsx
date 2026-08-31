/**
 * Decorative hero motif: an abstract ensemble forecast with a stroke-draw
 * entrance. Pure SVG on purpose — this is illustration, not a data chart,
 * so it never takes real data and stays out of the charting library.
 * Geometry ported 1:1 from the design canvas.
 */

function pts(
  vals: number[],
  x0: number,
  y0: number,
  w: number,
  h: number,
  min: number,
  max: number,
) {
  const n = vals.length;
  return vals.map((v, i) => ({
    x: Math.round((x0 + (w * i) / (n - 1)) * 10) / 10,
    y: Math.round((y0 + h - ((v - min) / (max - min)) * h) * 10) / 10,
  }));
}

function lineD(p: { x: number; y: number }[]) {
  return p.map((pt, i) => `${i ? "L" : "M"}${pt.x} ${pt.y}`).join(" ");
}

const HIST = [180, 168, 190, 150, 132, 160, 128, 108, 120, 96];
const MEDIAN = [96, 90, 80, 66];
const clamp = (v: number) => Math.min(215, Math.max(30, v));

const historyPts = pts(HIST, 40, 40, 290, 190, 60, 210);
const medianD = lineD(pts(MEDIAN, 330, 40, 210, 190, 60, 210));
const fanDs = Array.from({ length: 9 }, (_, k) => {
  const drift = (k - 4) * 7;
  const vals = [96, 92 + drift * 0.5, 84 + drift, 72 + drift * 1.7].map(clamp);
  return lineD(pts(vals, 330, 40, 210, 190, 60, 210));
});
const bandUpper = pts(MEDIAN.map((v) => v * 1.28), 330, 40, 210, 190, 60, 210);
const bandLower = pts(MEDIAN.map((v) => v * 0.75), 330, 40, 210, 190, 60, 210);
const bandD = `${lineD(bandUpper)} ${[...bandLower]
  .reverse()
  .map((p) => `L${p.x} ${p.y}`)
  .join(" ")} Z`;

const draw = (duration: number, delay: number) => ({
  strokeDasharray: 900,
  animation: `mp-draw ${duration}s cubic-bezier(.4,0,.2,1) ${delay}s both`,
});

export function HeroChart() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-lift">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="font-brand text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3">
          Ensemble forecast · dengue incidence
        </span>
        <span className="font-mono text-[10.5px] text-ink-3">
          5 models · 3-month horizon
        </span>
      </div>
      <svg viewBox="0 0 560 300" className="block h-auto w-full" aria-hidden>
        {[40, 105, 170, 235].map((y) => (
          <line key={y} x1={40} y1={y} x2={540} y2={y} stroke="var(--mp-border)" />
        ))}
        <rect x={330} y={30} width={210} height={215} fill="var(--mp-brand-tint)" opacity={0.55} />
        <path d={bandD} fill="var(--mp-brand)" opacity={0.13} />
        {fanDs.map((d, k) => (
          <path
            key={k}
            d={d}
            fill="none"
            stroke="var(--mp-brand)"
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.5}
            style={draw(1.6, 0.35 + k * 0.07)}
          />
        ))}
        <path
          d={medianD}
          fill="none"
          stroke="var(--mp-verified)"
          strokeWidth={2.6}
          strokeLinecap="round"
          style={draw(1.5, 0.9)}
        />
        <path
          d={lineD(historyPts)}
          fill="none"
          stroke="var(--mp-text)"
          strokeWidth={2.2}
          strokeLinecap="round"
          style={draw(1.4, 0)}
        />
        {historyPts.map((p) => (
          <circle key={p.x} cx={p.x} cy={p.y} r={2.6} fill="var(--mp-text)" />
        ))}
        <line x1={330} y1={24} x2={330} y2={252} stroke="var(--mp-text-3)" strokeDasharray="3 3" />
        <text x={336} y={21} fontSize={10} fill="var(--mp-text-3)" fontFamily="var(--font-mono)">
          forecast start
        </text>
        <text x={40} y={272} fontSize={10} fill="var(--mp-text-3)" fontFamily="var(--font-mono)">
          2025-08
        </text>
        <text x={300} y={272} fontSize={10} fill="var(--mp-text-3)" fontFamily="var(--font-mono)">
          2026-05
        </text>
        <text x={486} y={272} fontSize={10} fill="var(--mp-text-3)" fontFamily="var(--font-mono)">
          2026-08
        </text>
      </svg>
      <div className="flex items-center gap-5 border-t border-line px-4 pb-3.5 pt-3 text-[11.5px] text-ink-2">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-3.5 bg-ink" /> Observed
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-3.5 bg-verified" /> Ensemble median
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-3.5 rounded-[2px] bg-brand opacity-30" /> Member spread
        </span>
      </div>
    </div>
  );
}
