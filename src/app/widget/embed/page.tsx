"use client";

import { useState } from "react";
import { DomainData } from "@/lib/stockData";
import StockCard from "@/components/StockCard";

const SECTORS = ["Defense", "Pharma", "Fintech", "EV", "Renewable Energy", "PSU Banks", "IT Services"];

export default function WidgetEmbed() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DomainData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(domain: string) {
    const trimmed = domain.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else setResult(data);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">3S Stock Finder</span>
          <span className="text-xs text-blue-300">NSE · BSE · AI</span>
        </div>
      </div>

      <div className="p-4">
        <form onSubmit={(e) => { e.preventDefault(); search(input); }} className="flex gap-2 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter sector (e.g. Pharma, Defense…)"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            {loading ? "…" : "Go"}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); search(s); }}
              disabled={loading}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {loading && (
          <div className="space-y-3 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">{result.title}</p>
            {result.stocks.map((stock, i) => (
              <StockCard key={stock.name} stock={stock} index={i} />
            ))}
            <p className="text-xs text-slate-400 text-center pt-2">
              Powered by <a href="/" target="_blank" className="text-indigo-500 hover:underline">3S Stock Finder</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
