import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getRange, getPreviousClose } from "@/lib/polygon";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export interface BacktestPick {
  id: number;
  stockName: string;
  ticker: string;
  domain: string;
  entryDate: string;
  allocationPct: number;
  entryPrice: number | null;
  currentPrice: number | null;
  returnPct: number | null;
  priceHistory: { date: string; close: number }[];
}

export interface BacktestResult {
  summary: {
    totalPicks: number;
    picksWithData: number;
    avgReturn: number;
    winRate: number;
    bestPick: string | null;
    worstPick: string | null;
    daysTracked: number;
  };
  picks: BacktestPick[];
  portfolioChart: { date: string; value: number }[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "90");
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  // fetch all picks with tickers since cutoff
  const rows = await sql`
    SELECT p.id, p.stock_name, p.ticker, p.allocation_pct, p.created_at, s.domain
    FROM picks p
    JOIN searches s ON s.id = p.search_id
    WHERE p.ticker IS NOT NULL
      AND p.created_at >= ${since}
    ORDER BY p.created_at ASC
  `;

  // de-duplicate by ticker, keep earliest pick
  const seen = new Set<string>();
  const uniquePicks = rows.filter((r) => {
    if (seen.has(r.ticker)) return false;
    seen.add(r.ticker);
    return true;
  });

  // fetch price history for each ticker in parallel
  const picks: BacktestPick[] = await Promise.all(
    uniquePicks.map(async (row) => {
      const entryDate = new Date(row.created_at).toISOString().split("T")[0];
      const history = await getRange(row.ticker, entryDate, today).catch(() => []);
      const entryPrice = history[0]?.close ?? null;
      const currentPrice = await getPreviousClose(row.ticker).catch(() => null);
      const returnPct =
        entryPrice && currentPrice
          ? ((currentPrice - entryPrice) / entryPrice) * 100
          : null;

      return {
        id: row.id,
        stockName: row.stock_name,
        ticker: row.ticker,
        domain: row.domain,
        entryDate,
        allocationPct: row.allocation_pct ?? 33,
        entryPrice,
        currentPrice,
        returnPct: returnPct !== null ? parseFloat(returnPct.toFixed(2)) : null,
        priceHistory: history,
      };
    })
  );

  const withData = picks.filter((p) => p.returnPct !== null);
  const returns = withData.map((p) => p.returnPct as number);
  const avgReturn = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const winRate = returns.length ? returns.filter((r) => r > 0).length / returns.length : 0;
  const bestPick = withData.reduce<BacktestPick | null>(
    (best, p) => (!best || (p.returnPct ?? -Infinity) > (best.returnPct ?? -Infinity) ? p : best),
    null
  );
  const worstPick = withData.reduce<BacktestPick | null>(
    (worst, p) => (!worst || (p.returnPct ?? Infinity) < (worst.returnPct ?? Infinity) ? p : worst),
    null
  );

  // build equal-weight portfolio NAV chart
  const portfolioChart = buildPortfolioChart(withData);

  return NextResponse.json({
    summary: {
      totalPicks: picks.length,
      picksWithData: withData.length,
      avgReturn: parseFloat(avgReturn.toFixed(2)),
      winRate: parseFloat((winRate * 100).toFixed(1)),
      bestPick: bestPick?.stockName ?? null,
      worstPick: worstPick?.stockName ?? null,
      daysTracked: days,
    },
    picks,
    portfolioChart,
  } satisfies BacktestResult);
}

function buildPortfolioChart(
  picks: BacktestPick[]
): { date: string; value: number }[] {
  if (picks.length === 0) return [];

  // collect all dates across all picks
  const allDates = [
    ...new Set(picks.flatMap((p) => p.priceHistory.map((h) => h.date))),
  ].sort();

  if (allDates.length === 0) return [];

  return allDates.map((date) => {
    let weightedReturn = 0;
    let totalWeight = 0;

    for (const pick of picks) {
      const entry = pick.priceHistory[0]?.close;
      const dayClose = pick.priceHistory.find((h) => h.date === date)?.close;
      if (!entry || !dayClose) continue;
      const w = pick.allocationPct || 33;
      weightedReturn += ((dayClose - entry) / entry) * w;
      totalWeight += w;
    }

    const navValue = totalWeight > 0 ? 100 + weightedReturn / totalWeight : 100;
    return { date, value: parseFloat(navValue.toFixed(2)) };
  });
}
