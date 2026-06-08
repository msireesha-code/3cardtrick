import sql from "./db";
import { getRange, getPreviousClose } from "./polygon";

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

export async function runBacktest(days = 90): Promise<BacktestResult> {
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const rows = await sql`
    SELECT p.id, p.stock_name, p.ticker, p.allocation_pct, p.created_at, s.domain
    FROM picks p
    JOIN searches s ON s.id = p.search_id
    WHERE p.ticker IS NOT NULL
      AND p.created_at >= ${since}
    ORDER BY p.created_at ASC
  `;

  // de-duplicate by ticker — keep earliest pick
  const seen = new Set<string>();
  const unique = rows.filter((r) => {
    if (seen.has(r.ticker)) return false;
    seen.add(r.ticker);
    return true;
  });

  const picks: BacktestPick[] = await Promise.all(
    unique.map(async (row) => {
      const entryDate = new Date(row.created_at).toISOString().split("T")[0];
      const [history, currentPrice] = await Promise.all([
        getRange(row.ticker, entryDate, today).catch(() => []),
        getPreviousClose(row.ticker).catch(() => null),
      ]);
      const entryPrice = history[0]?.close ?? null;
      const returnPct =
        entryPrice && currentPrice
          ? parseFloat((((currentPrice - entryPrice) / entryPrice) * 100).toFixed(2))
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
        returnPct,
        priceHistory: history,
      };
    })
  );

  const withData = picks.filter((p) => p.returnPct !== null);
  const returns  = withData.map((p) => p.returnPct as number);
  const avgReturn = returns.length
    ? parseFloat((returns.reduce((a, b) => a + b, 0) / returns.length).toFixed(2))
    : 0;
  const winRate = returns.length
    ? parseFloat(((returns.filter((r) => r > 0).length / returns.length) * 100).toFixed(1))
    : 0;

  const best  = withData.reduce<BacktestPick | null>((b, p) => (!b || (p.returnPct ?? -Infinity) > (b.returnPct ?? -Infinity) ? p : b), null);
  const worst = withData.reduce<BacktestPick | null>((w, p) => (!w || (p.returnPct ?? Infinity) < (w.returnPct ?? Infinity) ? p : w), null);

  return {
    summary: {
      totalPicks: picks.length,
      picksWithData: withData.length,
      avgReturn,
      winRate,
      bestPick:  best?.stockName ?? null,
      worstPick: worst?.stockName ?? null,
      daysTracked: days,
    },
    picks,
    portfolioChart: buildPortfolioChart(withData),
  };
}

function buildPortfolioChart(picks: BacktestPick[]): { date: string; value: number }[] {
  if (picks.length === 0) return [];

  const allDates = [...new Set(picks.flatMap((p) => p.priceHistory.map((h) => h.date)))].sort();
  if (allDates.length === 0) return [];

  return allDates.map((date) => {
    let weightedReturn = 0;
    let totalWeight    = 0;

    for (const pick of picks) {
      const entry    = pick.priceHistory[0]?.close;
      const dayClose = pick.priceHistory.find((h) => h.date === date)?.close;
      if (!entry || !dayClose) continue;
      const w = pick.allocationPct || 33;
      weightedReturn += ((dayClose - entry) / entry) * w;
      totalWeight    += w;
    }

    const nav = totalWeight > 0 ? 100 + weightedReturn / totalWeight : 100;
    return { date, value: parseFloat(nav.toFixed(2)) };
  });
}
