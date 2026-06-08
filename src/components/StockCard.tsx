"use client";

import { Stock, investorTypeColors } from "@/lib/stockData";

interface StockCardProps {
  stock: Stock;
  index: number;
}

const rankColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
const rankLabels = ["#1 Top Pick", "#2 Strong Hold", "#3 Consider"];

function confidenceColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-600", label: "High" };
  if (score >= 50) return { bar: "bg-yellow-400", text: "text-yellow-600", label: "Medium" };
  return { bar: "bg-red-400", text: "text-red-500", label: "Low" };
}

function sentimentStyle(label: string) {
  if (label === "Bullish") return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
  if (label === "Bearish") return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
  return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
}

export default function StockCard({ stock, index }: StockCardProps) {
  const badgeClass = investorTypeColors[stock.investor] ?? "bg-gray-100 text-gray-800";
  const conf = stock.confidence ?? null;
  const confStyle = conf !== null ? confidenceColor(conf) : null;
  const f = stock.fundamentals;
  const s = stock.sentiment;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className={`text-xs font-bold uppercase tracking-widest ${rankColors[index]}`}>
            {rankLabels[index]}
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{stock.name}</h3>
          {stock.ticker && (
            <span className="text-xs font-mono text-slate-400 mt-0.5 block">{stock.ticker}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
            {stock.investor}
          </span>
          {stock.timeHorizon && (
            <span className="text-xs text-slate-400 font-medium">{stock.timeHorizon}</span>
          )}
          {f?.currentPrice && (
            <div className="text-right">
              <span className="text-sm font-bold text-slate-700">₹{f.currentPrice.toFixed(0)}</span>
              {f.dayChange !== null && (
                <span className={`ml-1.5 text-xs font-semibold ${f.dayChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {f.dayChange >= 0 ? "+" : ""}{f.dayChange}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confidence meter */}
      {conf !== null && confStyle && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Analyst Conviction</span>
            <span className={`text-xs font-bold ${confStyle.text}`}>{conf}/100 · {confStyle.label}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${confStyle.bar}`}
              style={{ width: `${conf}%` }}
            />
          </div>
        </div>
      )}

      {/* Why / Risks */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Why Buy</p>
            <p className="text-sm text-slate-700 mt-0.5">{stock.why}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key Risks</p>
            <p className="text-sm text-slate-700 mt-0.5">{stock.risks}</p>
          </div>
        </div>
      </div>

      {/* Catalysts */}
      {stock.catalysts && stock.catalysts.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Near-term Catalysts</p>
          <div className="flex flex-wrap gap-1.5">
            {stock.catalysts.map((c, i) => (
              <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fundamentals */}
      {f && (f.marketCap || f.pe || f.week52High) && (
        <div className="border-t border-slate-100 pt-3 mt-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Fundamentals</p>
          <div className="grid grid-cols-3 gap-2">
            {f.marketCap && (
              <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 text-center">
                <p className="text-xs text-slate-400">Mkt Cap</p>
                <p className="text-xs font-bold text-slate-700">{f.marketCap}</p>
              </div>
            )}
            {f.pe && (
              <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 text-center">
                <p className="text-xs text-slate-400">P/E</p>
                <p className="text-xs font-bold text-slate-700">{f.pe}x</p>
              </div>
            )}
            {f.week52High && f.week52Low && (
              <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 text-center">
                <p className="text-xs text-slate-400">52W Range</p>
                <p className="text-xs font-bold text-slate-700">
                  {f.week52Low.toFixed(0)}–{f.week52High.toFixed(0)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* News sentiment */}
      {s && (
        <div className="border-t border-slate-100 pt-3 mt-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">News Sentiment</p>
          {(() => {
            const ss = sentimentStyle(s.label);
            return (
              <div className={`flex items-start gap-2 rounded-xl px-3 py-2 border ${ss.bg} ${ss.border}`}>
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${ss.dot}`} />
                <div>
                  <span className={`text-xs font-bold ${ss.text}`}>{s.label}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{s.summary}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
