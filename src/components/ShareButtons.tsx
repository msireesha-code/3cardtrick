"use client";

import { useState } from "react";

interface ShareButtonsProps {
  shareId: string;
  domain: string;
}

export default function ShareButtons({ shareId, domain }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/${shareId}`
    : `/share/${shareId}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const tweetText = encodeURIComponent(`Top 3 ${domain} stocks on NSE/BSE — AI-powered picks by 3S Stock Finder\n\n${shareUrl}`);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={copyLink}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {copied ? "✓ Copied!" : "🔗 Copy link"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#1d9bf0]/20 hover:bg-[#1d9bf0]/30 border border-[#1d9bf0]/40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        𝕏 Share on Twitter
      </a>
    </div>
  );
}
