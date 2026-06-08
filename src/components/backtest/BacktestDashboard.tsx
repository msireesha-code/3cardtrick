"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { BacktestResult } from "@/app/api/backtest/route";

interface Props { data: BacktestResult }

function ReturnBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-slate-400">No data</span>;
  const positive = pct >= 0;
  return (
    <span className={`text-sm font-bold ${positive ? "text-emerald-600" : "text-red-500"}`}>
      {positive ? "+" : ""}{pct.toFixed(2)}%
    </span>
  );
}

export default function BacktestDashboard({ data }: Props) {
  const { summary, picks, portfolioChart } = data;
  const hasChart = portfolioChart.length > 1;

  const summaryCards = [
    { label: "Avg Return", value: `${summary.avgReturn >= 0 ? "+" : ""}${summary.avgReturn}%`, color: summary.avgReturn >= 0 ? "text-emerald-600" : "text-red-500" },
    { label: "Win Rate", value: `${summary.winRate}%`, color: summary.winRate >= 50 ? "text-emerald-600" : "text-amber-600" },
    { label: "Picks Tracked", value: `${summary.picksWithData}`, color: "text-blue-600" },
    { label: "Days Tracked", value: `${summary.daysTracked}d`, color: "text-slate-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">{c.label}</p>
            <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Highlights */}
      {(summary.bestPick || summary.worstPick) && (
        <div className="grid md:grid-cols-2 gap-4">
          {summary.bestPick && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Best Pick</p>
                <p className="text-sm font-semibold text-slate-800">{summary.bestPick}</p>
              </div>
            </div>
          )}
          {summary.worstPick && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="text-2xl">📉</div>
              <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Needs Review</p>
                <p className="text-sm font-semibold text-slate-800">{summary.worstPick}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio NAV chart */}
      {hasChart && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-700 mb-4">Portfolio NAV (base 100)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={portfolioChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                formatter={(v) => [`₹${Number(v ?? 0).toFixed(2)}`, "Portfolio"]}
                labelFormatter={(l) => `Date: ${l}`}
              />
              <ReferenceLine y={100} stroke="#cbd5e1" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Picks table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-700">All Tracked Picks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Domain</th>
                <th className="px-4 py-3 text-left">Ticker</th>
                <th className="px-4 py-3 text-right">Entry ₹</th>
                <th className="px-4 py-3 text-right">Current ₹</th>
                <th className="px-4 py-3 text-right">Return</th>
                <th className="px-4 py-3 text-left">Entry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {picks.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.stockName}</td>
                  <td className="px-4 py-3 text-slate-500">{p.domain}</td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-mono px-2 py-0.5 rounded">
                      {p.ticker}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {p.entryPrice ? `₹${p.entryPrice.toFixed(0)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {p.currentPrice ? `₹${p.currentPrice.toFixed(0)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ReturnBadge pct={p.returnPct} />
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.entryDate}</td>
                </tr>
              ))}
              {picks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No picks tracked yet — start searching to build your record
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
