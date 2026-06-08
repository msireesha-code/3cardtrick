import { Suspense } from "react";
import BacktestDashboard from "@/components/backtest/BacktestDashboard";
import type { BacktestResult } from "@/app/api/backtest/route";
import Link from "next/link";

async function fetchBacktest(days: number): Promise<BacktestResult> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/backtest?days=${days}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load backtest data");
  return res.json();
}

export default async function BacktestPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = parseInt(params.days ?? "90");
  const data = await fetchBacktest(days);

  const dayOptions = [30, 60, 90, 180];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-blue-300 hover:text-white text-sm transition-colors">
              ← Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-300">Backtest</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">AI Pick Backtest</h1>
          <p className="text-slate-300">Track how 3S stock picks have performed since the day they were made.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Day filter */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-sm font-medium text-slate-500">Show last:</span>
          {dayOptions.map((d) => (
            <Link
              key={d}
              href={`/backtest?days=${d}`}
              className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${
                days === d
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              {d}d
            </Link>
          ))}
        </div>

        <Suspense fallback={<div className="text-slate-400 text-center py-20">Loading backtest...</div>}>
          <BacktestDashboard data={data} />
        </Suspense>
      </div>
    </div>
  );
}
