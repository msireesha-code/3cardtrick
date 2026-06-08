// Yahoo Finance — free, no API key, full NSE/BSE coverage
// NSE tickers use .NS suffix, BSE use .BO suffix

const YF_BASE = "https://query1.finance.yahoo.com";

/** Resolve a company name → best NSE ticker (e.g. "Infosys" → "INFY.NS") */
export async function resolveTicker(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${YF_BASE}/v1/finance/search?q=${encodeURIComponent(name)}&region=IN&lang=en-IN&quotesCount=5`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const quotes: { symbol: string; exchange: string; quoteType: string }[] =
      data.quotes ?? [];
    // Prefer NSE (.NS) equity listings
    const nse = quotes.find((q) => q.symbol?.endsWith(".NS") && q.quoteType === "EQUITY");
    const bse = quotes.find((q) => q.symbol?.endsWith(".BO") && q.quoteType === "EQUITY");
    return nse?.symbol ?? bse?.symbol ?? quotes[0]?.symbol ?? null;
  } catch {
    return null;
  }
}

/** Get previous trading day's closing price in INR */
export async function getPreviousClose(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${YF_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const closes: number[] = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const last = [...closes].reverse().find((c) => c != null);
    return last ?? null;
  } catch {
    return null;
  }
}

/** Get daily closing prices for a date range (for backtesting) */
export async function getRange(
  ticker: string,
  from: string, // YYYY-MM-DD
  to: string    // YYYY-MM-DD
): Promise<{ date: string; close: number }[]> {
  try {
    const fromTs = Math.floor(new Date(from).getTime() / 1000);
    const toTs   = Math.floor(new Date(to).getTime() / 1000);
    const res = await fetch(
      `${YF_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&period1=${fromTs}&period2=${toTs}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return [];
    const timestamps: number[] = result.timestamp ?? [];
    const closes: number[]     = result.indicators?.quote?.[0]?.close ?? [];
    return timestamps
      .map((ts, i) => ({
        date:  new Date(ts * 1000).toISOString().split("T")[0],
        close: closes[i],
      }))
      .filter((r) => r.close != null);
  } catch {
    return [];
  }
}

/** Company summary (market cap, sector) */
export async function getTickerDetails(ticker: string) {
  try {
    const res = await fetch(
      `${YF_BASE}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=assetProfile,summaryDetail`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.quoteSummary?.result?.[0] ?? null;
  } catch {
    return null;
  }
}
