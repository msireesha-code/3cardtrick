"use client";

import { useState } from "react";
import { stockDatabase, DomainData } from "@/lib/stockData";
import StockCard from "./StockCard";
import AllocationBar from "./AllocationBar";

const SUGGESTED_DOMAINS = ["AI", "EV", "Defense", "Pharma", "Fintech", "Sports", "Icecream"];

export default function StockFinder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DomainData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState("");

  function search(domain: string) {
    const key = domain.trim().toLowerCase();
    const data = stockDatabase[key];
    if (data) {
      setResult(data);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
    setSearched(domain.trim());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) search(input);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Scan · Select · Size
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            3S Stock Finder
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Enter any market domain and get the top 3 stocks with a smart allocation strategy.
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
            placeholder="Enter domain (e.g. AI, EV, defense, fintech...)"
            className="flex-1 px-4 py-3 text-slate-800 text-base outline-none bg-transparent placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
          >
            Run 3S
          </button>
        </form>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {SUGGESTED_DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => {
                setInput(d);
                search(d);
              }}
              className="text-xs font-medium bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {notFound && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 text-center">
            <p className="text-lg font-semibold mb-1">No data found for &ldquo;{searched}&rdquo;</p>
            <p className="text-sm text-amber-600">
              Try one of the suggested domains above, or check back later as we add more sectors.
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {result.title}
              </h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
                3S Report
              </span>
            </div>

            <div className="grid gap-4">
              {result.stocks.map((stock, i) => (
                <StockCard key={stock.name} stock={stock} index={i} />
              ))}
            </div>

            <AllocationBar allocation={result.allocation} />
          </div>
        )}

        {!result && !notFound && (
          <div className="text-center text-slate-400 py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium text-slate-500">Enter a domain above to get started</p>
            <p className="text-sm mt-2">Try domains like AI, EV, defense, pharma, or fintech</p>
          </div>
        )}
      </div>
    </div>
  );
}
