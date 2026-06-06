"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Slice { name: string; value: number; color: string }
interface Props { data: Slice[]; total: number }

export default function StatusDonut({ data, total }: Props) {
  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={78}
            paddingAngle={3}
            dataKey="value"
            label={({ percent }: { percent?: number }) =>
              (percent ?? 0) > 0.04 ? `${Math.round((percent ?? 0) * 100)}%` : ""
            }
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`${v} tasks`, ""]} />
          <Legend iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
