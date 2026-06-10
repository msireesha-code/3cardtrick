import Link from "next/link";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

async function getTrending() {
  const rows = await sql`
    SELECT
      LOWER(TRIM(domain)) AS domain,
      COUNT(*) AS count
    FROM searches
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY LOWER(TRIM(domain))
    ORDER BY count DESC
    LIMIT 10
  `;
  return rows as { domain: string; count: string }[];
}

async function getAllTime() {
  const rows = await sql`
    SELECT
      LOWER(TRIM(domain)) AS domain,
      COUNT(*) AS count
    FROM searches
    GROUP BY LOWER(TRIM(domain))
    ORDER BY count DESC
    LIMIT 10
  `;
  return rows as { domain: string; count: string }[];
}

const RANK_COLORS = [
  "text-yellow-500", "text-slate-400", "text-amber-600",
  "text-indigo-400", "text-indigo-400", "text-slate-500",
  "text-slate-500", "text-slate-500", "text-slate-500", "text-slate-500",
];

export default async function TrendingPage() {
  const [weekly, allTime] = await Promise.all([getTrending(), getAllTime()]);
  const maxCount = parseInt(weekly[0]?.count ?? "1");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · Updated in real time
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Trending Sectors</h1>
          <p className="text-slate-300">Most searched Indian market sectors this week</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-8">
        {/* This week */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4">This Week</h2>
          {weekly.length === 0 ? (
            <p className="text-slate-400 text-sm">No searches yet this week.</p>
          ) : (
            <div className="space-y-3">
              {weekly.map((row, i) => {
                const pct = Math.round((parseInt(row.count) / maxCount) * 100);
                return (
                  <Link
                    key={row.domain}
                    href={`/?q=${encodeURIComponent(row.domain)}`}
                    className="block bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold w-6 ${RANK_COLORS[i]}`}>#{i + 1}</span>
                        <span className="font-semibold text-slate-800 capitalize">{row.domain}</span>
                      </div>
                      <span className="text-sm text-slate-400 font-medium">{row.count} searches</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* All time */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4">All Time</h2>
          {allTime.length === 0 ? (
            <p className="text-slate-400 text-sm">No searches yet.</p>
          ) : (
            <div className="space-y-3">
              {allTime.map((row, i) => (
                <Link
                  key={row.domain}
                  href={`/?q=${encodeURIComponent(row.domain)}`}
                  className="block bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-6 ${RANK_COLORS[i]}`}>#{i + 1}</span>
                      <span className="font-semibold text-slate-800 capitalize">{row.domain}</span>
                    </div>
                    <span className="text-sm text-slate-400 font-medium">{row.count} searches</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12 text-center">
        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Search any sector →
        </Link>
      </div>
    </div>
  );
}
