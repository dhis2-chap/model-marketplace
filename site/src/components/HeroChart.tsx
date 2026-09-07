/**
 * The hero's visual anchor: an ensemble forecast fan drawn straight onto
 * the plotting board (no card chrome). Pure SVG on purpose — this is
 * illustration, not a data chart, so it never takes real data and stays
 * out of the charting library. The board palette is constant across
 * themes, so the plot colors are literals.
 */

const HISTORY = "#ECF4FA";
const MEDIAN = "#45D68C";
const FAN = "#6FC3F2";
const RULE = "rgba(158, 203, 238, 0.22)";
const LABEL = "#9FBED8";

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
const MEDIAN_VALS = [96, 90, 80, 66];
const clamp = (v: number) => Math.min(215, Math.max(30, v));

const historyPts = pts(HIST, 40, 40, 290, 190, 60, 210);
const medianD = lineD(pts(MEDIAN_VALS, 330, 40, 210, 190, 60, 210));
const fanDs = Array.from({ length: 9 }, (_, k) => {
  const drift = (k - 4) * 7;
  const vals = [96, 92 + drift * 0.5, 84 + drift, 72 + drift * 1.7].map(clamp);
  return lineD(pts(vals, 330, 40, 210, 190, 60, 210));
});
const bandUpper = pts(MEDIAN_VALS.map((v) => v * 1.28), 330, 40, 210, 190, 60, 210);
const bandLower = pts(MEDIAN_VALS.map((v) => v * 0.75), 330, 40, 210, 190, 60, 210);
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
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-4 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-board-ink-2">
        <span>Ensemble forecast · dengue incidence</span>
        <span className="hidden sm:block">5 members · 3-month horizon</span>
      </div>
      <svg viewBox="0 0 560 290" className="block h-auto w-full" aria-hidden>
        {[40, 105, 170, 235].map((y) => (
          <line key={y} x1={40} y1={y} x2={548} y2={y} stroke={RULE} />
        ))}
        <path d={bandD} fill={FAN} opacity={0.14} />
        {fanDs.map((d, k) => (
          <path
            key={k}
            d={d}
            fill="none"
            stroke={FAN}
            strokeWidth={1.4}
            strokeLinecap="round"
            opacity={0.55}
            style={draw(1.6, 0.35 + k * 0.07)}
          />
        ))}
        <path
          d={medianD}
          fill="none"
          stroke={MEDIAN}
          strokeWidth={2.8}
          strokeLinecap="round"
          style={draw(1.5, 0.9)}
        />
        <path
          d={lineD(historyPts)}
          fill="none"
          stroke={HISTORY}
          strokeWidth={2.2}
          strokeLinecap="round"
          style={draw(1.4, 0)}
        />
        {historyPts.map((p) => (
          <circle key={p.x} cx={p.x} cy={p.y} r={2.6} fill={HISTORY} />
        ))}
        <line
          x1={330}
          y1={24}
          x2={330}
          y2={252}
          stroke={LABEL}
          strokeDasharray="3 3"
          opacity={0.7}
        />
        <text x={336} y={21} fontSize={10} fill={LABEL} fontFamily="var(--font-mono)">
          forecast start
        </text>
        <text x={40} y={274} fontSize={10} fill={LABEL} fontFamily="var(--font-mono)">
          2025-08
        </text>
        <text x={300} y={274} fontSize={10} fill={LABEL} fontFamily="var(--font-mono)">
          2026-05
        </text>
        <text x={486} y={274} fontSize={10} fill={LABEL} fontFamily="var(--font-mono)">
          2026-08
        </text>
      </svg>
      <div className="flex items-center gap-5 px-1 pt-1 font-mono text-[10.5px] text-board-ink-2">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-3.5" style={{ background: HISTORY }} /> observed
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-3.5" style={{ background: MEDIAN }} /> ensemble median
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-2 w-3.5 rounded-[1px]"
            style={{ background: FAN, opacity: 0.35 }}
          />{" "}
          member spread
        </span>
      </div>
    </div>
  );
}
