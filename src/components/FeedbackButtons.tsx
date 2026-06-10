"use client";

import { useState } from "react";

export default function FeedbackButtons({ pickId }: { pickId: number }) {
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  async function vote(v: 1 | -1) {
    setVoted(v);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pickId, vote: v }),
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-400 mr-1">Helpful?</span>
      <button
        onClick={() => vote(1)}
        className={`text-sm px-2 py-1 rounded-lg border transition-all ${
          voted === 1
            ? "bg-emerald-50 border-emerald-300 text-emerald-600"
            : "border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500"
        }`}
        title="Good pick"
      >
        👍
      </button>
      <button
        onClick={() => vote(-1)}
        className={`text-sm px-2 py-1 rounded-lg border transition-all ${
          voted === -1
            ? "bg-red-50 border-red-300 text-red-500"
            : "border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-400"
        }`}
        title="Bad pick"
      >
        👎
      </button>
      {voted !== null && (
        <span className="text-xs text-slate-400 ml-1">Thanks!</span>
      )}
    </div>
  );
}
