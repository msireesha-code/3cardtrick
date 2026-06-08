import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getOrCreateUserId, getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/watchlist
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ tickers: [] });
  const rows = await sql`SELECT ticker FROM watchlist WHERE user_id = ${userId}`;
  return NextResponse.json({ tickers: rows.map((r) => r.ticker) });
}

// POST /api/watchlist — toggle: add if absent, remove if present
export async function POST(req: NextRequest) {
  const userId = await getOrCreateUserId();
  if (!userId) return NextResponse.json({ error: "Session error" }, { status: 500 });

  const { ticker, stockName } = await req.json();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  const existing = await sql`SELECT id FROM watchlist WHERE user_id = ${userId} AND ticker = ${ticker}`;

  if (existing.length > 0) {
    await sql`DELETE FROM watchlist WHERE user_id = ${userId} AND ticker = ${ticker}`;
    return NextResponse.json({ watching: false });
  } else {
    await sql`
      INSERT INTO watchlist (user_id, ticker, stock_name)
      VALUES (${userId}, ${ticker}, ${stockName ?? ticker})
      ON CONFLICT DO NOTHING
    `;
    return NextResponse.json({ watching: true });
  }
}
