"use client";

import { Stock, investorTypeColors } from "@/lib/stockData";

interface StockCardProps {
  stock: Stock;
  index: number;
}

const rankColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
const rankLabels = ["#1 Top Pick", "#2 Strong Hold", "#3 Consider"];

export default function StockCard({ stock, index }: StockCardProps) {
  const badgeClass =
    investorTypeColors[stock.investor] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className={`text-xs font-bold uppercase tracking-widest ${rankColors[index]}`}>
            {rankLabels[index]}
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{stock.name}</h3>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
          {stock.investor}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="mt-0.5">
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
          <div className="mt-0.5">
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
    </div>
  );
}
