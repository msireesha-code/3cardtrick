import Link from "next/link";
import { getUserId } from "@/lib/session";
import { getPreviousClose } from "@/lib/polygon";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

async function getHoldings(userId: number) {
  const rows = await sql`
    SELECT pp.id, pp.ticker, pp.stock_name, pp.entry_price, pp.created_at
    FROM portfolio_picks pp
    WHERE pp.user_id = ${userId}
    ORDER BY pp.created_at DESC
  `;

  return Promise.all(
    rows.map(async (r) => {
      const currentPrice = await getPreviousClose(r.ticker).catch(() => null);
      const entryPrice = r.entry_price ? parseFloat(r.entry_price) : null;
      const pnlPct =
        entryPrice && currentPrice
          ? parseFloat((((currentPrice - entryPrice) / entryPrice) * 100).toFixed(2))
          : null;
      return {
        id: r.id as number,
        ticker: r.ticker as string,
        stock_name: r.stock_name as string,
        created_at: r.created_at as string,
        entryPrice,
        currentPrice,
        pnlPct,
      };
    })
  );
}

export default async function PortfolioPage() {
  const userId = await getUserId();
  const holdings = userId ? await getHoldings(userId) : [];

  const totalPnl =
    holdings.filter((h) => h.pnlPct !== null).length > 0
      ? holdings.reduce((sum, h) => sum + (h.pnlPct ?? 0), 0) /
        holdings.filter((h) => h.pnlPct !== null).length
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4 text-sm">
            <Link href="/" className="text-blue-300 hover:text-white transition-colors">← Home</Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">Portfolio</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">My Portfolio</h1>
              <p className="text-slate-300">{holdings.length} holdings tracked</p>
            </div>
            {totalPnl !== null && (
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Avg Return</p>
                <p className={`text-3xl font-extrabold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {holdings.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-lg font-medium text-slate-500">No holdings yet</p>
            <p className="text-sm mt-2">Click <strong>Add to Portfolio</strong> on any stock card to start tracking.</p>
            <Link href="/" className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Browse Stocks
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Stock</th>
                  <th className="px-5 py-3 text-left">Ticker</th>
                  <th className="px-5 py-3 text-right">Entry ₹</th>
                  <th className="px-5 py-3 text-right">Current ₹</th>
                  <th className="px-5 py-3 text-right">P&L</th>
                  <th className="px-5 py-3 text-left">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holdings.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800">{h.stock_name}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{h.ticker}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-600">
                      {h.entryPrice ? `₹${h.entryPrice.toFixed(0)}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-700 font-medium">
                      {h.currentPrice ? `₹${h.currentPrice.toFixed(0)}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {h.pnlPct !== null ? (
                        <span className={`font-bold ${h.pnlPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct}%
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {new Date(h.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <RemoveButton holdingId={h.id} ticker={h.ticker} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RemoveButton({ holdingId, ticker }: { holdingId: number; ticker: string }) {
  return (
    <form action={`/api/portfolio?ticker=${ticker}`} method="DELETE">
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
        title="Remove from portfolio"
      >
        Remove
      </button>
    </form>
  );
}
