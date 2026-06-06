import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { resolveTicker } from "@/lib/polygon";
import { getStackUserId } from "@/lib/stack";

const SYSTEM_PROMPT = `You are a financial analyst. When given a market domain, return exactly 3 stock recommendations as JSON. No markdown, no explanation — only valid JSON matching this exact shape:
{
  "title": "string (e.g. 'Artificial Intelligence Industry')",
  "stocks": [
    {
      "name": "string",
      "why": "string (1-2 sentences on the investment thesis)",
      "risks": "string (1-2 sentences on key risks)",
      "investor": "string (one of: Core Holding, Growth, Moderate Growth, Aggressive Growth, Aggressive, Balanced Growth, Long-Term Growth)"
    }
  ],
  "allocation": [
    ["Stock Name", "XX%"],
    ["Stock Name", "XX%"],
    ["Stock Name", "XX%"]
  ]
}
Allocations must sum to 100%. Rank stocks from strongest to most speculative.`;

async function resolveDbUserId(stackId: string | null): Promise<number | null> {
  if (!stackId) return null;
  try {
    // upsert user on first search so we don't need a webhook
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
  allocation: [string, string][]
) {
  try {
    const [search] = await sql`
      INSERT INTO searches (user_id, domain) VALUES (${userId}, ${domain}) RETURNING id
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
  } catch (err) {
    console.error("Failed to persist search:", err);
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

  const stackId = await getStackUserId();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://3cardtrick.vercel.app",
      "X-Title": "3S Stock Finder",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Give me the top 3 stocks for the domain: ${domain}` },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: response.status });
  }

  const data    = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content);

    const userId = await resolveDbUserId(stackId);
    persistSearch(domain, userId, parsed.stocks ?? [], parsed.allocation ?? []);

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Model returned invalid JSON", raw: content },
      { status: 500 }
    );
  }
}
