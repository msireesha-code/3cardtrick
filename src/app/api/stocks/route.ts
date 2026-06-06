import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

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

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/msireesha-code/3cardtrick",
      "X-Title": "3S Stock Finder",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Give me the top 3 stocks for the domain: ${domain}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json(
      { error: `OpenRouter error: ${err}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Model returned invalid JSON", raw: content },
      { status: 500 }
    );
  }
}
