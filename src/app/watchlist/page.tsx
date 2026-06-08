import Link from "next/link";
import { getUserId } from "@/lib/session";
import { getPreviousClose } from "@/lib/polygon";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

async function getWatchlist(userId: number) {
  const rows = await sql`
    SELECT w.id, w.ticker, w.stock_name, w.added_at,
           a.id as alert_id, a.target_price, a.direction, a.triggered
    FROM watchlist w
    LEFT JOIN alerts a ON a.ticker = w.ticker AND a.user_id = w.user_id AND a.triggered = false
    WHERE w.user_id = ${userId}
    ORDER BY w.added_at DESC
  `;

  const unique = [...new Map(rows.map((r) => [r.ticker, r])).values()];
  return Promise.all(
    unique.map(async (r) => {
      const currentPrice = await getPreviousClose(r.ticker as string).catch(() => null);
      return {
        ticker: r.ticker as string,
        stock_name: r.stock_name as string,
        added_at: r.added_at as string,
        alert_id: r.alert_id as number | null,
        target_price: r.target_price as string | null,
        direction: r.direction as string | null,
        triggered: r.triggered as boolean | null,
        currentPrice,
      };
    })
  );
}

export default async function WatchlistPage() {
  const userId = await getUserId();
  const items = userId ? await getWatchlist(userId) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4 text-sm">
            <Link href="/" className="text-blue-300 hover:text-white transition-colors">← Home</Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">Watchlist</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-1">Watchlist</h1>
          <p className="text-slate-300">{items.length} stocks being tracked</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-lg font-medium text-slate-500">Watchlist is empty</p>
            <p className="text-sm mt-2">Click the star icon on any stock card to watch it.</p>
            <Link href="/" className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Browse Stocks
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.ticker} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800">{item.stock_name}</p>
                  <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{item.ticker}</span>
                </div>
                <div className="text-right">
                  {item.currentPrice && (
                    <p className="text-lg font-bold text-slate-700">₹{item.currentPrice.toFixed(0)}</p>
                  )}
                  {item.target_price && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Alert: {item.direction} ₹{parseFloat(item.target_price).toFixed(0)}
                    </p>
                  )}
                </div>
                <AlertForm ticker={item.ticker} stockName={item.stock_name} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertForm({ ticker, stockName }: { ticker: string; stockName: string }) {
  return (
    <form action="/api/alerts" method="POST" className="flex items-center gap-2">
      <input type="hidden" name="ticker" value={ticker} />
      <input type="hidden" name="stockName" value={stockName} />
      <input
        type="number"
        name="targetPrice"
        placeholder="₹ target"
        className="w-24 text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        step="0.01"
      />
      <select name="direction" className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
        <option value="above">Above</option>
        <option value="below">Below</option>
      </select>
      <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
        Set Alert
      </button>
    </form>
  );
}
