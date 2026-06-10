import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { resolveTicker } from "@/lib/polygon";
import { getStackUserId } from "@/lib/stack";
import { retrieveChunks } from "@/lib/edgar";
import { getFundamentals, getNewsSentiment } from "@/lib/marketData";

const SYSTEM_PROMPT = `You are a senior SEBI-registered equity analyst focused exclusively on the Indian stock market (NSE and BSE listed companies). When given a market domain or sector, return exactly 3 Indian stock recommendations as JSON. No markdown, no explanation — only valid JSON matching this exact shape:
{
  "title": "string (e.g. 'Indian Artificial Intelligence Sector')",
  "stocks": [
    {
      "name": "string (Indian company name, NSE/BSE listed)",
      "ticker": "string (NSE ticker symbol, e.g. INFY, TCS, RELIANCE)",
      "why": "string (2-3 sentences on the investment thesis — India-specific: domestic growth, govt policy tailwinds, promoter quality, etc.)",
      "risks": "string (2-3 sentences on key risks — India-specific: SEBI scrutiny, FII flows, rupee risk, etc.)",
      "investor": "string (one of: Core Holding, Growth, Moderate Growth, Aggressive Growth, Aggressive, Balanced Growth, Long-Term Growth)",
      "confidence": number (0-100, conviction score based on fundamentals, promoter holding, ROE, debt levels, and sector tailwinds),
      "timeHorizon": "string (one of: Short (1-2yr), Medium (3-5yr), Long (5yr+))",
      "catalysts": ["string", "string", "string"] (exactly 3 near-term catalysts — earnings, govt orders, capex cycle, index inclusion, etc.)
    }
  ],
  "allocation": [
    ["Stock Name", "XX%"],
    ["Stock Name", "XX%"],
    ["Stock Name", "XX%"]
  ]
}
Only recommend NSE/BSE listed Indian companies. Allocations must sum to 100%. Rank from highest to lowest conviction. Confidence scores should reflect true conviction — avoid clustering around 70.`;

async function callLLM(apiKey: string, model: string, messages: { role: string; content: string }[]) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://3cardtrick.vercel.app",
      "X-Title": "3S Stock Finder",
    },
    body: JSON.stringify({ model, response_format: { type: "json_object" }, messages }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

async function resolveDbUserId(stackId: string | null): Promise<number | null> {
  if (!stackId) return null;
  try {
    const rows = await sql`
      INSERT INTO users (stack_id) VALUES (${stackId})
      ON CONFLICT (stack_id) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `;
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function persistSearch(
  domain: string,
  userId: number | null,
  picks: { name: string; why: string; risks: string; investor: string }[],
  allocation: [string, string][],
  resultJson: unknown
): Promise<string | null> {
  try {
    const { nanoid } = await import("nanoid");
    const shareId = nanoid(10);
    const [search] = await sql`
      INSERT INTO searches (user_id, domain, share_id, result_json)
      VALUES (${userId}, ${domain}, ${shareId}, ${JSON.stringify(resultJson)})
      RETURNING id, share_id
    `;
    const searchId = search.id;
    for (let i = 0; i < picks.length; i++) {
      const p = picks[i];
      const allocPct = parseInt(allocation[i]?.[1] ?? "0");
      const ticker = await resolveTicker(p.name).catch(() => null);
      await sql`
        INSERT INTO picks (search_id, stock_name, ticker, why, risks, investor_type, allocation_pct)
        VALUES (${searchId}, ${p.name}, ${ticker}, ${p.why}, ${p.risks}, ${p.investor}, ${allocPct})
      `;
    }
    return shareId;
  } catch (err) {
    console.error("Failed to persist search:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model  = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!apiKey || apiKey === "your_openrouter_key_here") {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured in .env.local" },
      { status: 500 }
    );
  }

  const { domain } = await req.json();
  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  // Step 1 — get stock names with a fast first pass
  const firstPassContent = await callLLM(apiKey, model, [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Give me the top 3 stocks for the domain: ${domain}` },
  ]);

  let parsed: { title: string; stocks: { name: string; why: string; risks: string; investor: string; confidence?: number; timeHorizon?: string; catalysts?: string[] }[]; allocation: [string, string][] };
  try {
    parsed = JSON.parse(firstPassContent);
  } catch {
    return NextResponse.json({ error: "Model returned invalid JSON", raw: firstPassContent }, { status: 500 });
  }

  // Step 2 — RAG: retrieve earnings context for these stocks (non-blocking, best-effort)
  const stockNames = parsed.stocks.map((s) => s.name);
  const ragChunks = await retrieveChunks(stockNames, domain).catch(() => []);

  // Step 3 — if we have RAG context, do a second pass to enrich the analysis
  if (ragChunks.length > 0) {
    const context = ragChunks.join("\n\n");
    const enrichedContent = await callLLM(apiKey, model, [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Give me the top 3 stocks for the domain: ${domain}\n\nHere are excerpts from recent SEC filings for the companies you're considering:\n\n${context}\n\nUse these filings to sharpen your analysis — update confidence scores and catalysts to reflect what management said.`,
      },
    ]).catch(() => firstPassContent);

    try {
      const enriched = JSON.parse(enrichedContent);
      // tag each stock so UI can show "RAG-enriched"
      enriched.ragEnriched = true;
      parsed = enriched;
    } catch {
      // fall back to first pass
    }
  }

  // Enrich each stock with fundamentals + news sentiment in parallel
  const enriched = await Promise.all(
    (parsed.stocks ?? []).map(async (stock: { name: string; ticker?: string; [key: string]: unknown }) => {
      const yahooTicker = stock.ticker
        ? (stock.ticker.includes(".") ? stock.ticker : `${stock.ticker}.NS`)
        : await resolveTicker(stock.name).catch(() => null);

      const [fundamentals, sentiment] = await Promise.all([
        yahooTicker ? getFundamentals(yahooTicker).catch(() => null) : Promise.resolve(null),
        yahooTicker
          ? getNewsSentiment(yahooTicker, stock.name, apiKey, model).catch(() => null)
          : Promise.resolve(null),
      ]);

      return { ...stock, ticker: yahooTicker, fundamentals, sentiment };
    })
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsed.stocks = enriched as any;

  const { getOrCreateUserId } = await import("@/lib/session");
  const userId = await getOrCreateUserId().catch(() => null);
  const shareId = await persistSearch(domain, userId, parsed.stocks ?? [], parsed.allocation ?? [], parsed);

  return NextResponse.json({ ...parsed, shareId });
}
