import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getOrCreateUserId, getUserId } from "@/lib/session";
import { getPreviousClose } from "@/lib/polygon";

export const dynamic = "force-dynamic";

// GET /api/portfolio — list holdings with current price + P&L
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ holdings: [] });

  const rows = await sql`
    SELECT pp.id, pp.ticker, pp.stock_name, pp.entry_price, pp.created_at,
           p.close_price as last_synced_price
    FROM portfolio_picks pp
    LEFT JOIN prices p ON p.ticker = pp.ticker
      AND p.date = (SELECT MAX(date) FROM prices WHERE ticker = pp.ticker)
    WHERE pp.user_id = ${userId}
    ORDER BY pp.created_at DESC
  `;

  const holdings = await Promise.all(
    rows.map(async (r) => {
      const currentPrice = r.last_synced_price
        ? parseFloat(r.last_synced_price)
        : await getPreviousClose(r.ticker).catch(() => null);

      const entryPrice = r.entry_price ? parseFloat(r.entry_price) : null;
      const pnlPct =
        entryPrice && currentPrice
          ? parseFloat((((currentPrice - entryPrice) / entryPrice) * 100).toFixed(2))
          : null;

      return {
        id: r.id,
        ticker: r.ticker,
        stockName: r.stock_name,
        entryPrice,
        currentPrice,
        pnlPct,
        addedAt: r.created_at,
      };
    })
  );

  return NextResponse.json({ holdings });
}

// POST /api/portfolio — add a pick to portfolio
export async function POST(req: NextRequest) {
  const userId = await getOrCreateUserId();
  if (!userId) return NextResponse.json({ error: "Session error" }, { status: 500 });

  const { ticker, stockName, entryPrice } = await req.json();
  if (!ticker || !stockName) return NextResponse.json({ error: "ticker and stockName required" }, { status: 400 });

  const price = entryPrice ?? await getPreviousClose(ticker).catch(() => null);

  await sql`
    INSERT INTO portfolio_picks (user_id, ticker, stock_name, entry_price)
    VALUES (${userId}, ${ticker}, ${stockName}, ${price})
    ON CONFLICT DO NOTHING
  `;

  return NextResponse.json({ ok: true, ticker, entryPrice: price });
}

// DELETE /api/portfolio?ticker=INFY.NS
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No session" }, { status: 401 });

  const ticker = new URL(req.url).searchParams.get("ticker");
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  await sql`DELETE FROM portfolio_picks WHERE user_id = ${userId} AND ticker = ${ticker}`;
  return NextResponse.json({ ok: true });
}
