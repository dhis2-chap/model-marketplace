"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

/**
 * Benchmark charts. All series rendered here come from mock fixtures
 * (lib/mock-benchmarks.ts) and sit under a "mock data · illustrative" chip.
 */

const AXIS_TICK = {
  fontSize: 9,
  fontFamily: "var(--font-mono)",
  fill: "var(--mp-text-3)",
} as const;

function ChartTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[4px] border border-line bg-surface px-2.5 py-2 shadow-lift">
      <div className="mb-1 font-brand text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
        {label}
      </div>
      {payload
        .filter((p) => typeof p.value === "number")
        .map((p) => (
          <div key={String(p.dataKey)} className="flex items-center gap-2 font-mono text-[11px] text-ink">
            <span
              className="inline-block h-0.5 w-3"
              style={{ background: p.color ?? "var(--mp-brand)" }}
            />
            {String(p.name)}: {Number(p.value).toFixed(2)}
          </div>
        ))}
    </div>
  );
}

export function CrpsByHorizonChart({
  crps,
  baseline,
  shortName,
}: {
  crps: number[];
  baseline: number[];
  shortName: string;
}) {
  const data = crps.map((v, i) => ({
    h: `h${i + 1}`,
    model: v,
    baseline: baseline[i],
    band: [v * 0.8, v * 1.22] as [number, number],
  }));
  return (
    <div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -22 }}>
            <CartesianGrid vertical={false} stroke="var(--mp-border)" />
            <XAxis dataKey="h" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 1.4]} ticks={[0, 0.5, 0.9, 1.4]} tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <Tooltip content={ChartTooltip} cursor={{ stroke: "var(--mp-border-strong)" }} />
            <Area
              dataKey="band"
              name="spread"
              stroke="none"
              fill="var(--mp-brand)"
              fillOpacity={0.12}
              isAnimationActive={false}
              tooltipType="none"
            />
            <Line
              dataKey="baseline"
              name="baseline"
              stroke="var(--mp-text-3)"
              strokeWidth={1.6}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="model"
              name={shortName}
              stroke="var(--mp-brand)"
              strokeWidth={2.2}
              dot={{ r: 3, fill: "var(--mp-surface)", stroke: "var(--mp-brand)", strokeWidth: 1.8 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2.5 flex items-center gap-4 text-[11px] text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-brand" /> {shortName}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-ink-3" /> baseline
        </span>
      </div>
    </div>
  );
}

export function ComparisonChart({
  items,
}: {
  items: { name: string; mean: number; self: boolean }[];
}) {
  return (
    <div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 16, right: 8, bottom: 0, left: -22 }}>
            <CartesianGrid vertical={false} stroke="var(--mp-border)" />
            <XAxis
              dataKey="name"
              tick={{ ...AXIS_TICK, fontFamily: "var(--font-brand)" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis domain={[0, 1.1]} ticks={[0, 0.4, 0.7, 1.1]} tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <Tooltip content={ChartTooltip} cursor={{ fill: "var(--mp-surface-3)", fillOpacity: 0.4 }} />
            <Bar dataKey="mean" name="mean CRPS" barSize={34} radius={[2, 2, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="mean"
                position="top"
                formatter={(v: React.ReactNode) => Number(v).toFixed(2)}
                style={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--mp-text)" }}
              />
              {items.map((item) => (
                <Cell
                  key={item.name}
                  fill={item.self ? "var(--mp-brand)" : "var(--mp-surface-3)"}
                  stroke={item.self ? "none" : "var(--mp-border-strong)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2.5 flex items-center gap-4 text-[11px] text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-brand" /> this model
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] border border-line-strong bg-surface-3" /> others in set
        </span>
      </div>
    </div>
  );
}

export function CountrySkillBars({
  rows,
}: {
  rows: [country: string, skill: number][];
}) {
  return (
    <div className="flex flex-col gap-[11px]">
      {rows.map(([country, v]) => (
        <div key={country}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[12px] text-ink">{country}</span>
            <span className="font-mono text-[11px] text-ink-2">
              +{Math.round(v * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-[2px] bg-surface-3">
            <div
              className="h-2 max-w-full rounded-[2px] bg-brand"
              style={{ width: Math.round(v * 240) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
