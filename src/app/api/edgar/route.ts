import { NextRequest, NextResponse } from "next/server";
import { ingestTicker } from "@/lib/edgar";

export const maxDuration = 60;

// POST /api/edgar  { ticker: "NVDA", company: "NVIDIA" }
export async function POST(req: NextRequest) {
  const { ticker, company } = await req.json();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  try {
    const count = await ingestTicker(ticker, company ?? ticker);
    return NextResponse.json({ ticker, inserted: count });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
