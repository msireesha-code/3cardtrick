import sql from "./db";

const EDGAR_BASE = "https://data.sec.gov";
const HEADERS = { "User-Agent": "3S Stock Finder sireesha.mandava@oneconvergence.com" };

// Resolve CIK from ticker using SEC EDGAR company facts API
export async function resolveCIK(ticker: string): Promise<string | null> {
  try {
    const res = await fetch(`${EDGAR_BASE}/submissions/CIK0000000000.json`, { headers: HEADERS });
    // Use the company tickers JSON instead
    const tickersRes = await fetch("https://www.sec.gov/files/company_tickers.json", { headers: HEADERS });
    if (!tickersRes.ok) return null;
    const data = await tickersRes.json();
    const entry = Object.values(data as Record<string, { cik_str: number; ticker: string; title: string }>)
      .find((e) => e.ticker.toUpperCase() === ticker.toUpperCase());
    if (!entry) return null;
    return String(entry.cik_str).padStart(10, "0");
  } catch {
    return null;
  }
}

// Fetch recent 10-K or 10-Q filings for a CIK
async function getRecentFilings(cik: string, formType: "10-K" | "10-Q", limit = 2) {
  const res = await fetch(`${EDGAR_BASE}/submissions/CIK${cik}.json`, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  const filings = data.filings?.recent;
  if (!filings) return [];

  const results: { accessionNumber: string; reportDate: string; form: string }[] = [];
  for (let i = 0; i < filings.form.length && results.length < limit; i++) {
    if (filings.form[i] === formType) {
      results.push({
        accessionNumber: filings.accessionNumber[i].replace(/-/g, ""),
        reportDate: filings.reportDate[i],
        form: filings.form[i],
      });
    }
  }
  return results;
}

// Extract relevant sections from an EDGAR filing document
function chunkText(text: string, maxChunkSize = 800): string[] {
  // Split on paragraph breaks, then chunk by size
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 80);
  const chunks: string[] = [];
  let current = "";
  for (const para of paras) {
    if ((current + para).length > maxChunkSize && current) {
      chunks.push(current.trim());
      current = "";
    }
    current += " " + para;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.slice(0, 40); // max 40 chunks per filing
}

// Ingest one ticker's recent filings into earnings_chunks
export async function ingestTicker(ticker: string, companyName: string): Promise<number> {
  const cik = await resolveCIK(ticker);
  if (!cik) throw new Error(`CIK not found for ${ticker}`);

  const [tenKs, tenQs] = await Promise.all([
    getRecentFilings(cik, "10-K", 1),
    getRecentFilings(cik, "10-Q", 2),
  ]);

  const filings = [...tenKs, ...tenQs];
  let inserted = 0;

  for (const filing of filings) {
    const acc = filing.accessionNumber;
    const indexUrl = `${EDGAR_BASE}/Archives/edgar/full-index/${acc.slice(0,4)}/${acc.slice(4,6)}/${acc}/${acc}-index.json`;
    const indexRes = await fetch(indexUrl, { headers: HEADERS }).catch(() => null);
    if (!indexRes?.ok) continue;

    const index = await indexRes.json().catch(() => null);
    if (!index) continue;

    // Find the main HTM document
    const items: { name: string; type: string }[] = index.directory?.item ?? [];
    const mainDoc = items.find(
      (f) => f.type === filing.form && f.name.endsWith(".htm")
    ) ?? items.find((f) => f.name.endsWith(".htm"));
    if (!mainDoc) continue;

    const docUrl = `${EDGAR_BASE}/Archives/edgar/full-index/${acc.slice(0,4)}/${acc.slice(4,6)}/${acc}/${mainDoc.name}`;
    const docRes = await fetch(docUrl, { headers: HEADERS }).catch(() => null);
    if (!docRes?.ok) continue;

    let html = await docRes.text();
    // Strip HTML tags
    const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
    const period = filing.reportDate.slice(0, 7); // "2024-03"
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      await sql`
        INSERT INTO earnings_chunks (ticker, company_name, filing_type, period, chunk, tokens)
        VALUES (${ticker.toUpperCase()}, ${companyName}, ${filing.form}, ${period}, ${chunk}, ${Math.ceil(chunk.length / 4)})
        ON CONFLICT DO NOTHING
      `.catch(() => null);
      inserted++;
    }
  }

  return inserted;
}

// Retrieve top-k relevant chunks for a query using full-text search
export async function retrieveChunks(tickers: string[], query: string, k = 5): Promise<string[]> {
  if (tickers.length === 0) return [];

  const tickerList = tickers.map((t) => t.toUpperCase());
  const rows = await sql`
    SELECT ticker, period, filing_type, chunk,
           ts_rank(search_vector, plainto_tsquery('english', ${query})) AS rank
    FROM earnings_chunks
    WHERE ticker = ANY(${tickerList})
      AND search_vector @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT ${k}
  `.catch(() => []);

  return rows.map((r) => `[${r.ticker} ${r.filing_type} ${r.period}]: ${r.chunk}`);
}
