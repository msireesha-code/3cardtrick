import { NextRequest, NextResponse } from "next/server";
import { runBacktest } from "@/lib/backtest";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export type { BacktestResult, BacktestPick } from "@/lib/backtest";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "90");
  const result = await runBacktest(days);
  return NextResponse.json(result);
}
