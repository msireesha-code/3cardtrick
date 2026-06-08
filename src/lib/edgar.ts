import sql from "./db";

// BSE India public filings API — no key needed
const BSE_BASE = "https://api.bseindia.com/BseIndiaAPI/api";
const NSE_BASE = "https://www.nseindia.com/api";

function chunkText(text: string, maxChunkSize = 800): string[] {
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
  return chunks.slice(0, 40);
}

// Fetch recent annual/quarterly report announcements from BSE
async function getBSEFilings(bseCode: string, limit = 3): Promise<{ url: string; period: string; type: string }[]> {
  try {
    const res = await fetch(
      `${BSE_BASE}/AnnSubCategoryGetData/w?pageno=1&strCat=Result&strPrevDate=&strScrip=${bseCode}&strSearch=P&strToDate=&strType=C&subcategory=-1`,
      { headers: { Referer: "https://www.bseindia.com" }, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: { PDFFLAG: string; NSURL: string; DT_TM: string; CATEGORYNAME: string }[] =
      data.Table ?? [];
    return items
      .filter((i) => i.PDFFLAG === "1" && i.NSURL)
      .slice(0, limit)
      .map((i) => ({
        url: i.NSURL,
        period: i.DT_TM?.slice(0, 7) ?? "",
        type: i.CATEGORYNAME ?? "Result",
      }));
  } catch {
    return [];
  }
}

// Resolve BSE scrip code from NSE ticker using Yahoo Finance search
async function resolveBSECode(ticker: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&region=IN&quotesCount=3`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const bo = (data.quotes ?? []).find((q: { symbol: string }) => q.symbol?.endsWith(".BO"));
    if (!bo) return null;
    return bo.symbol.replace(".BO", "");
  } catch {
    return null;
  }
}

// Ingest BSE quarterly/annual reports for a ticker
export async function ingestTicker(ticker: string, companyName: string): Promise<number> {
  const bseCode = await resolveBSECode(ticker);
  if (!bseCode) throw new Error(`BSE code not found for ${ticker}`);

  const filings = await getBSEFilings(bseCode, 3);
  let inserted = 0;

  for (const filing of filings) {
    try {
      const docRes = await fetch(filing.url, { signal: AbortSignal.timeout(15000) });
      if (!docRes.ok) continue;
      const contentType = docRes.headers.get("content-type") ?? "";
      // Only process text/HTML responses (PDF parsing would need a library)
      if (!contentType.includes("html")) continue;
      const html = await docRes.text();
      const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
      const chunks = chunkText(text);

      for (const chunk of chunks) {
        await sql`
          INSERT INTO earnings_chunks (ticker, company_name, filing_type, period, chunk, tokens)
          VALUES (${ticker.toUpperCase()}, ${companyName}, ${filing.type}, ${filing.period}, ${chunk}, ${Math.ceil(chunk.length / 4)})
          ON CONFLICT DO NOTHING
        `.catch(() => null);
        inserted++;
      }
    } catch {
      continue;
    }
  }

  return inserted;
}

// Retrieve top-k relevant chunks for a query using full-text search
export async function retrieveChunks(stockNames: string[], query: string, k = 5): Promise<string[]> {
  if (stockNames.length === 0) return [];

  // Try matching by company name or ticker
  const rows = await sql`
    SELECT ticker, period, filing_type, chunk,
           ts_rank(search_vector, plainto_tsquery('english', ${query})) AS rank
    FROM earnings_chunks
    WHERE (
      ticker = ANY(${stockNames.map((n) => n.toUpperCase())})
      OR company_name ILIKE ANY(${stockNames.map((n) => `%${n}%`)})
    )
    AND search_vector @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT ${k}
  `.catch(() => []);

  return rows.map((r) => `[${r.ticker} ${r.filing_type} ${r.period}]: ${r.chunk}`);
}
