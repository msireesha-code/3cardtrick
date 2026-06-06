const BASE = "https://api.polygon.io";

function apiKey() {
  const key = process.env.POLYGON_API_KEY;
  if (!key) throw new Error("POLYGON_API_KEY is not set in environment");
  return key;
}

/** Resolve a company name → best-matching ticker symbol */
export async function resolveTicker(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${BASE}/v3/reference/tickers?search=${encodeURIComponent(name)}&active=true&limit=5&apiKey=${apiKey()}`,
      { next: { revalidate: 86400 } } // cache 24h
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.ticker ?? null;
  } catch {
    return null;
  }
}

/** Get the previous trading day's closing price for a ticker */
export async function getPreviousClose(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${BASE}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey()}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.c ?? null;
  } catch {
    return null;
  }
}

/** Get OHLCV for a date range (for backtesting) */
export async function getRange(
  ticker: string,
  from: string, // YYYY-MM-DD
  to: string    // YYYY-MM-DD
): Promise<{ date: string; close: number }[]> {
  try {
    const res = await fetch(
      `${BASE}/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey()}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((r: any) => ({
      date:  new Date(r.t).toISOString().split("T")[0],
      close: r.c,
    }));
  } catch {
    return [];
  }
}

/** Company details (market cap, description) */
export async function getTickerDetails(ticker: string) {
  try {
    const res = await fetch(
      `${BASE}/v3/reference/tickers/${ticker}?apiKey=${apiKey()}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results ?? null;
  } catch {
    return null;
  }
}
