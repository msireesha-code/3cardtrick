import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getPreviousClose, resolveTicker } from "@/lib/polygon";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // verify cron secret so only Vercel Cron can call this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // collect all distinct tickers we need prices for
  const [watchlistTickers, portfolioTickers, pickTickers] = await Promise.all([
    sql`SELECT DISTINCT ticker FROM watchlist WHERE ticker IS NOT NULL`,
    sql`SELECT DISTINCT ticker FROM portfolio_picks WHERE ticker IS NOT NULL`,
    sql`SELECT DISTINCT ticker FROM picks WHERE ticker IS NOT NULL AND created_at > NOW() - INTERVAL '90 days'`,
  ]);

  const tickers = [
    ...new Set([
      ...watchlistTickers.map((r) => r.ticker),
      ...portfolioTickers.map((r) => r.ticker),
      ...pickTickers.map((r) => r.ticker),
    ]),
  ].filter(Boolean);

  if (tickers.length === 0) {
    return NextResponse.json({ synced: 0, message: "No tickers to sync" });
  }

  const today = new Date().toISOString().split("T")[0];
  let synced = 0;
  const errors: string[] = [];

  for (const ticker of tickers) {
    try {
      const close = await getPreviousClose(ticker);
      if (close === null) continue;

      await sql`
        INSERT INTO prices (ticker, date, close_price)
        VALUES (${ticker}, ${today}, ${close})
        ON CONFLICT (ticker, date) DO UPDATE SET close_price = EXCLUDED.close_price
      `;
      synced++;
    } catch (err) {
      errors.push(`${ticker}: ${err}`);
    }
  }

  return NextResponse.json({ synced, total: tickers.length, errors });
}
