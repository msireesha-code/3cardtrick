import Link from "next/link";

export const metadata = {
  title: "Methodology — 3S Stock Finder",
  description: "How 3S Stock Finder generates AI-powered Indian stock recommendations.",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">Methodology</h1>
          <p className="text-slate-300">How 3S Stock Finder generates its recommendations.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6 text-slate-700 text-sm leading-relaxed">

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">The 3S Framework</h2>
          <p>
            3S stands for <strong>Sector · Stock · Strategy</strong>. Given any Indian market sector, the system identifies the top 3 NSE/BSE-listed companies, assigns a capital allocation strategy, and provides a structured investment thesis for each.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">Step 1 — AI Stock Selection</h2>
          <p>
            A large language model (LLM) acting as a SEBI-analyst persona selects 3 stocks for the given sector. The model is instructed to consider promoter quality, ROE, debt levels, sector tailwinds, and India-specific macroeconomic factors. Each stock receives a confidence score (0–100), time horizon, and 3 near-term catalysts.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">Step 2 — RAG Enrichment</h2>
          <p>
            If BSE filing data is available for the selected companies, relevant excerpts are retrieved from a vector-indexed database of quarterly and annual reports. These are injected into a second LLM pass to sharpen the analysis with management commentary and forward guidance.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">Step 3 — Market Data Enrichment</h2>
          <p>
            Live and historical price data is fetched from Yahoo Finance (NSE/BSE tickers with .NS/.BO suffixes). Each stock card shows current price, day change %, 52-week range, day range, and sector classification.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">Step 4 — News Sentiment</h2>
          <p>
            Recent headlines for each stock are fetched from Google News RSS (India locale). The LLM then classifies overall sentiment as Bullish, Neutral, or Bearish with a short summary of key themes.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">Backtesting</h2>
          <p>
            All AI picks are stored in the database. The backtesting engine computes the return of each pick from the day it was made to the current price, using Yahoo Finance historical data. Win rate and average return are computed across all picks in a rolling window.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">Limitations</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>AI models may produce hallucinated or outdated information</li>
            <li>Confidence scores are model-estimated, not actuarial</li>
            <li>Market cap and P/E data are not always available (requires paid data feeds)</li>
            <li>BSE filing RAG is only as current as the last ingestion run</li>
            <li>Backtesting does not account for brokerage fees, taxes, or slippage</li>
          </ul>
        </section>

        <div className="pt-4 flex gap-4">
          <Link href="/disclaimer" className="text-amber-600 hover:underline font-medium">Read Disclaimer →</Link>
          <Link href="/" className="text-slate-500 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
