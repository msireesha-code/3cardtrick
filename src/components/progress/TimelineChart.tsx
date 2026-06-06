"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, LabelList } from "recharts";

interface TimelineItem {
  phase: string; label: string; weekStart: number; weekEnd: number; duration: number;
}
interface Props { data: TimelineItem[] }

const COLORS = ["#3b82f6","#6366f1","#8b5cf6","#a855f7","#ec4899","#f43f5e"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-slate-800">{d.phase}: {d.label}</p>
      <p className="text-slate-500 mt-1">Weeks {d.weekStart} – {d.weekEnd}</p>
      <p className="text-slate-500">{d.duration} week{d.duration > 1 ? "s" : ""}</p>
    </div>
  );
};

export default function TimelineChart({ data }: Props) {
  // offset bar: invisible spacer + visible duration
  const chartData = data.map((d) => ({
    ...d,
    spacer: d.weekStart - 1,
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }} barCategoryGap="30%">
          <XAxis
            type="number" domain={[0, 15]}
            tickCount={16}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(v) => v === 0 ? "" : `W${v}`}
            axisLine={false} tickLine={false}
          />
          <YAxis
            type="category" dataKey="phase"
            tick={{ fontSize: 12, fill: "#64748b" }}
            width={28} axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
          {/* invisible spacer */}
          <Bar dataKey="spacer" stackId="g" fill="transparent" isAnimationActive={false} />
          {/* actual duration bar */}
          <Bar dataKey="duration" stackId="g" radius={6} barSize={18}>
            <LabelList
              dataKey="label"
              position="insideLeft"
              style={{ fontSize: 10, fill: "#fff", fontWeight: 600 }}
              formatter={(v) => { const s = String(v ?? ""); return s.length > 22 ? s.slice(0, 22) + "…" : s; }}
            />
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
