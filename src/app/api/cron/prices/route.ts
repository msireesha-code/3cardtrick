import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getPreviousClose } from "@/lib/polygon";
import { sendAlertEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Collect all tickers across watchlist, portfolio, recent picks
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

  const today = new Date().toISOString().split("T")[0];
  let synced = 0;
  const errors: string[] = [];
  const priceMap: Record<string, number> = {};

  for (const ticker of tickers) {
    try {
      const close = await getPreviousClose(ticker);
      if (close === null) continue;
      priceMap[ticker] = close;
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

  // Evaluate untriggered alerts
  let alertsTriggered = 0;
  try {
    const alerts = await sql`
      SELECT a.id, a.ticker, a.stock_name, a.target_price, a.direction,
             u.email
      FROM alerts a
      JOIN users u ON u.id = a.user_id
      WHERE a.triggered = false
    `;

    for (const alert of alerts) {
      const price = priceMap[alert.ticker] ?? await getPreviousClose(alert.ticker).catch(() => null);
      if (price === null) continue;

      const triggered =
        alert.direction === "above" ? price >= alert.target_price :
        alert.direction === "below" ? price <= alert.target_price : false;

      if (triggered) {
        await sql`UPDATE alerts SET triggered = true, triggered_at = NOW() WHERE id = ${alert.id}`;
        if (alert.email) {
          await sendAlertEmail({
            to: alert.email,
            ticker: alert.ticker,
            stockName: alert.stock_name,
            targetPrice: parseFloat(alert.target_price),
            currentPrice: price,
            direction: alert.direction,
          }).catch(() => null);
        }
        alertsTriggered++;
      }
    }
  } catch (err) {
    errors.push(`alert eval: ${err}`);
  }

  return NextResponse.json({ synced, total: tickers.length, alertsTriggered, errors });
}
