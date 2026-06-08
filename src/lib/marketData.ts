// Fetch fundamentals and news from Yahoo Finance — no API key needed

const YF = "https://query1.finance.yahoo.com";

export interface Fundamentals {
  marketCap: string | null;
  pe: string | null;
  week52High: number | null;
  week52Low: number | null;
  sector: string | null;
  currentPrice: number | null;
  dayChange: number | null;        // % change today
}

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  published: string;
}

export async function getFundamentals(ticker: string): Promise<Fundamentals> {
  try {
    const res = await fetch(
      `${YF}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=summaryDetail,price,assetProfile`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return emptyFundamentals();
    const data = await res.json();
    const result = data.quoteSummary?.result?.[0];
    if (!result) return emptyFundamentals();

    const summary = result.summaryDetail ?? {};
    const price   = result.price ?? {};
    const profile = result.assetProfile ?? {};

    const mcRaw = price.marketCap?.raw as number | undefined;
    const marketCap = mcRaw
      ? mcRaw >= 1e12 ? `₹${(mcRaw / 1e12).toFixed(1)}T`
      : mcRaw >= 1e9  ? `₹${(mcRaw / 1e9).toFixed(0)}B`
      : `₹${(mcRaw / 1e6).toFixed(0)}M`
      : null;

    const pe = summary.trailingPE?.raw
      ? String(summary.trailingPE.raw.toFixed(1))
      : null;

    return {
      marketCap,
      pe,
      week52High: summary.fiftyTwoWeekHigh?.raw ?? null,
      week52Low:  summary.fiftyTwoWeekLow?.raw ?? null,
      sector:     profile.sector ?? null,
      currentPrice: price.regularMarketPrice?.raw ?? null,
      dayChange:    price.regularMarketChangePercent?.raw != null
        ? parseFloat((price.regularMarketChangePercent.raw * 100).toFixed(2))
        : null,
    };
  } catch {
    return emptyFundamentals();
  }
}

function emptyFundamentals(): Fundamentals {
  return { marketCap: null, pe: null, week52High: null, week52Low: null, sector: null, currentPrice: null, dayChange: null };
}

export async function getNews(ticker: string, count = 5): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `${YF}/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=${count}&quotesCount=0`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const news: { title: string; publisher: string; link: string; providerPublishTime: number }[] =
      data.news ?? [];
    return news.slice(0, count).map((n) => ({
      title:     n.title,
      publisher: n.publisher,
      link:      n.link,
      published: new Date(n.providerPublishTime * 1000).toISOString().split("T")[0],
    }));
  } catch {
    return [];
  }
}

export async function getNewsSentiment(
  ticker: string,
  stockName: string,
  apiKey: string,
  model: string
): Promise<{ score: number; label: "Bullish" | "Neutral" | "Bearish"; summary: string }> {
  const news = await getNews(ticker, 6);
  if (news.length === 0) return { score: 50, label: "Neutral", summary: "No recent news found." };

  const headlines = news.map((n) => `- ${n.title} (${n.publisher})`).join("\n");

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          {
            role: "system",
            content: `You are a news sentiment analyst. Given recent news headlines about an Indian stock, return JSON with: {"score": number 0-100 (0=very bearish, 50=neutral, 100=very bullish), "label": "Bullish"|"Neutral"|"Bearish", "summary": "one sentence summarising sentiment"}`,
          },
          {
            role: "user",
            content: `Stock: ${stockName} (${ticker})\n\nRecent headlines:\n${headlines}`,
          },
        ],
      }),
    });
    if (!res.ok) return { score: 50, label: "Neutral", summary: "Sentiment unavailable." };
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    return {
      score:   parsed.score ?? 50,
      label:   parsed.label ?? "Neutral",
      summary: parsed.summary ?? "",
    };
  } catch {
    return { score: 50, label: "Neutral", summary: "Sentiment unavailable." };
  }
}
