import BacktestDashboard from "@/components/backtest/BacktestDashboard";
import { runBacktest } from "@/lib/backtest";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BacktestPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = parseInt(params.days ?? "90");

  let data;
  try {
    data = await runBacktest(days);
  } catch {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-lg font-semibold">Failed to load backtest data</p>
          <p className="text-sm mt-1">Check server logs for details</p>
        </div>
      </div>
    );
  }

  const dayOptions = [30, 60, 90, 180];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-blue-300 hover:text-white text-sm transition-colors">← Home</Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-300">Backtest</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">AI Pick Backtest</h1>
          <p className="text-slate-300">Track how 3S stock picks have performed since the day they were made.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
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

        <BacktestDashboard data={data} />
      </div>
    </div>
  );
}
