"use client";

import { Area, ComposedChart, Line, ResponsiveContainer, YAxis } from "recharts";

/** Tiny CRPS sparkline for catalog cards. Data is mock, labeled in the card. */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return <div className="h-11" />;
  const data = values.map((v, i) => ({ i, v }));
  const pad = 0.06;
  return (
    <div className="h-11">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <YAxis hide domain={[Math.min(...values) - pad, Math.max(...values) + pad]} />
          <Area
            dataKey="v"
            stroke="none"
            fill="var(--mp-brand)"
            fillOpacity={0.1}
            isAnimationActive={false}
          />
          <Line
            dataKey="v"
            stroke="var(--mp-brand)"
            strokeWidth={1.8}
            strokeLinecap="round"
            isAnimationActive={false}
            dot={(props: { index?: number; cx?: number; cy?: number }) =>
              props.index === values.length - 1 ? (
                <circle
                  key="end"
                  cx={props.cx}
                  cy={props.cy}
                  r={2.8}
                  fill="var(--mp-brand)"
                />
              ) : (
                <g key={props.index} />
              )
            }
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
