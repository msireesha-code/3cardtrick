import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getOrCreateUserId, getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/alerts
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ alerts: [] });
  const rows = await sql`
    SELECT id, ticker, stock_name, target_price, direction, triggered, created_at
    FROM alerts WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  return NextResponse.json({ alerts: rows });
}

// POST /api/alerts  { ticker, stockName, targetPrice, direction: "above"|"below" }
export async function POST(req: NextRequest) {
  const userId = await getOrCreateUserId();
  if (!userId) return NextResponse.json({ error: "Session error" }, { status: 500 });

  const { ticker, stockName, targetPrice, direction } = await req.json();
  if (!ticker || !targetPrice || !direction) {
    return NextResponse.json({ error: "ticker, targetPrice, direction required" }, { status: 400 });
  }

  await sql`
    INSERT INTO alerts (user_id, ticker, stock_name, target_price, direction)
    VALUES (${userId}, ${ticker}, ${stockName ?? ticker}, ${targetPrice}, ${direction})
  `;
  return NextResponse.json({ ok: true });
}

// DELETE /api/alerts?id=123
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No session" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await sql`DELETE FROM alerts WHERE id = ${id} AND user_id = ${userId}`;
  return NextResponse.json({ ok: true });
}
