"use client";

import { useState } from "react";
import { DomainData } from "@/lib/stockData";
import StockCard from "./StockCard";
import AllocationBar from "./AllocationBar";
import ShareButtons from "./ShareButtons";

const SUGGESTED_DOMAINS = [
  "Defense", "Pharma", "Fintech", "EV",
  "Renewable Energy", "PSU Banks", "IT Services",
  "FMCG", "Infrastructure", "Textiles",
];

export default function StockFinder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DomainData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("3s_recent") ?? "[]"); } catch { return []; }
  });

  async function search(domain: string) {
    const trimmed = domain.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setSearched(trimmed);

    // persist recent searches in localStorage
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 6);
      try { localStorage.setItem("3s_recent", JSON.stringify(next)); } catch {}
      return next;
    });

    try {
      const res = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(input);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            NSE · BSE · Powered by AI
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              3S Stock Finder
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Enter any Indian market sector and get the top 3 NSE/BSE stocks with smart allocation — generated live by AI.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-2 flex gap-2 border border-slate-200"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter any sector (e.g. Defense, Pharma, PSU Banks, Green Energy...)"
            className="flex-1 px-4 py-3 text-slate-800 text-base outline-none bg-transparent placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Thinking...
              </>
            ) : "Run 3S"}
          </button>
        </form>

        {/* Suggested sectors */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {SUGGESTED_DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => { setInput(d); search(d); }}
              disabled={loading}
              className="text-xs font-medium bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-40"
            >
              {d}
            </button>
          ))}
        </div>

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 justify-center items-center">
            <span className="text-xs text-slate-400 font-medium">Recent:</span>
            {recentSearches.map((d) => (
              <button
                key={d}
                onClick={() => { setInput(d); search(d); }}
                disabled={loading}
                className="text-xs font-medium bg-indigo-50 border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-40"
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-slate-200 rounded-lg w-64" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="h-5 bg-slate-200 rounded w-48 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
            <div className="bg-slate-800 rounded-2xl p-6 h-40" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-center">
            <p className="text-lg font-semibold mb-1">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{result.title}</h2>
              <div className="flex items-center gap-2">
                {result.ragEnriched && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Filing Context
                  </span>
                )}
                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
                  3S Report · {searched}
                </span>
              </div>
            </div>
            {result.shareId && (
              <div className="flex items-center gap-2 flex-wrap">
                <ShareButtons shareId={result.shareId} domain={searched} />
              </div>
            )}

            <div className="grid gap-4">
              {result.stocks.map((stock, i) => (
                <StockCard key={stock.name} stock={stock} index={i} />
              ))}
            </div>

            <AllocationBar allocation={result.allocation} />
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && (
          <div className="text-center text-slate-400 py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium text-slate-500">Enter any Indian market sector to get AI-powered NSE/BSE picks</p>
            <p className="text-sm mt-2">Works for any sector — defence, pharma, banks, infra, and more</p>
          </div>
        )}
      </div>
    </div>
  );
}
