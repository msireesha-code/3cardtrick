"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList,
} from "recharts";

interface PhaseBar {
  name: string; label: string;
  done: number; in_progress: number; todo: number; blocked: number;
  total: number; pct: number;
}
interface Props { data: PhaseBar[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + p.value, 0);
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-6">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-slate-100 pt-1 mt-1 flex justify-between">
        <span className="text-slate-500">Total</span>
        <span className="font-bold">{total}</span>
      </div>
    </div>
  );
};

export default function PhaseProgressBars({ data }: Props) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 48 }} barCategoryGap="30%">
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="name"
            tick={{ fontSize: 12, fill: "#64748b" }}
            width={28} axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="done"        name="Done"        stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
          <Bar dataKey="in_progress" name="In Progress" stackId="a" fill="#3b82f6" />
          <Bar dataKey="todo"        name="To Do"       stackId="a" fill="#e2e8f0" />
          <Bar dataKey="blocked"     name="Blocked"     stackId="a" fill="#ef4444" radius={[4,4,4,4]}>
            <LabelList
              dataKey="pct"
              position="right"
              formatter={(v) => `${v}%`}
              style={{ fontSize: 11, fill: "#64748b" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
