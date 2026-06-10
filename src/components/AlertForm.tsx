"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AlertForm({ ticker, stockName }: { ticker: string; stockName: string }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState("above");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetPrice) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, stockName, targetPrice: parseFloat(targetPrice), direction }),
      });
      if (res.ok) {
        setStatus("done");
        setTargetPrice("");
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <input
        type="number"
        value={targetPrice}
        onChange={(e) => setTargetPrice(e.target.value)}
        placeholder="₹ target"
        className="w-24 text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        step="0.01"
        min="0"
      />
      <select
        value={direction}
        onChange={(e) => setDirection(e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <option value="above">Above</option>
        <option value="below">Below</option>
      </select>
      <button
        type="submit"
        disabled={status === "saving" || !targetPrice}
        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : status === "done" ? "✓ Set!" : status === "error" ? "Error" : "Set Alert"}
      </button>
    </form>
  );
}
