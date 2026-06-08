// Yahoo Finance — free endpoints only (v8 chart + search)
// v10 quoteSummary requires auth since 2025, use v8 chart meta instead

const YF1 = "https://query1.finance.yahoo.com";
const YF2 = "https://query2.finance.yahoo.com";

export interface Fundamentals {
  currentPrice: number | null;
  dayChange: number | null;     // % vs previous close
  week52High: number | null;
  week52Low: number | null;
  sector: string | null;
  industry: string | null;
  dayHigh: number | null;
  dayLow: number | null;
}

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
}

// Use v8 chart meta — only free endpoint that returns price + 52w range
export async function getFundamentals(ticker: string): Promise<Fundamentals> {
  try {
    const [chartRes, searchRes] = await Promise.all([
      fetch(`${YF2}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`, {
        next: { revalidate: 900 },
      }),
      fetch(`${YF1}/v1/finance/search?q=${encodeURIComponent(ticker)}&quotesCount=1&newsCount=0`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const chartData = chartRes.ok ? await chartRes.json() : null;
    const searchData = searchRes.ok ? await searchRes.json() : null;

    const meta = chartData?.chart?.result?.[0]?.meta ?? {};
    const searchQuote = searchData?.quotes?.[0] ?? {};

    const current: number | null = meta.regularMarketPrice ?? null;
    const prevClose: number | null = meta.chartPreviousClose ?? null;
    const dayChange =
      current !== null && prevClose !== null && prevClose !== 0
        ? parseFloat((((current - prevClose) / prevClose) * 100).toFixed(2))
        : null;

    return {
      currentPrice: current,
      dayChange,
      week52High:  meta.fiftyTwoWeekHigh ?? null,
      week52Low:   meta.fiftyTwoWeekLow ?? null,
      dayHigh:     meta.regularMarketDayHigh ?? null,
      dayLow:      meta.regularMarketDayLow ?? null,
      sector:      searchQuote.sector ?? null,
      industry:    searchQuote.industry ?? null,
    };
  } catch {
    return { currentPrice: null, dayChange: null, week52High: null, week52Low: null, sector: null, industry: null, dayHigh: null, dayLow: null };
  }
}

// Google News RSS — returns India-relevant headlines
export async function getNews(query: string, count = 5): Promise<NewsItem[]> {
  try {
    const q = encodeURIComponent(`${query} NSE BSE stock`);
    const res = await fetch(
      `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const xml = await res.text();

    const items: NewsItem[] = [];
    const regex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<source[^>]*>(.*?)<\/source>[\s\S]*?<\/item>/g;
    let match;
    while ((match = regex.exec(xml)) !== null && items.length < count) {
      items.push({
        title:     match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
        link:      match[2].trim(),
        publisher: match[3].replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
      });
    }
    return items;
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
  const news = await getNews(stockName, 5);
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
            content: `You are a financial news sentiment analyst for Indian markets. Given recent news headlines about an Indian stock, return JSON: {"score": number 0-100 (0=very bearish,50=neutral,100=very bullish), "label": "Bullish"|"Neutral"|"Bearish", "summary": "one sentence"}`,
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
      score:   typeof parsed.score === "number" ? parsed.score : 50,
      label:   ["Bullish", "Neutral", "Bearish"].includes(parsed.label) ? parsed.label : "Neutral",
      summary: parsed.summary ?? "",
    };
  } catch {
    return { score: 50, label: "Neutral", summary: "Sentiment unavailable." };
  }
}
