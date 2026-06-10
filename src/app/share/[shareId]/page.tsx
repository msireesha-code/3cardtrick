import { notFound } from "next/navigation";
import Link from "next/link";
import sql from "@/lib/db";
import StockCard from "@/components/StockCard";
import AllocationBar from "@/components/AllocationBar";
import ShareButtons from "@/components/ShareButtons";
import { DomainData } from "@/lib/stockData";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const rows = await sql`SELECT domain FROM searches WHERE share_id = ${shareId} LIMIT 1`;
  const domain = rows[0]?.domain ?? "Indian Stocks";
  const ogUrl = `/api/og?id=${shareId}`;
  return {
    title: `Top 3 ${domain} stocks — 3S Stock Finder`,
    description: `AI-powered NSE/BSE stock picks for the ${domain} sector.`,
    openGraph: {
      title: `Top 3 ${domain} stocks — 3S Stock Finder`,
      description: `AI-powered NSE/BSE stock picks for the ${domain} sector.`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Top 3 ${domain} stocks — 3S Stock Finder`,
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const rows = await sql`SELECT domain, result_json, created_at FROM searches WHERE share_id = ${shareId} LIMIT 1`;
  if (!rows[0]) notFound();

  const { domain, result_json, created_at } = rows[0];
  const result = result_json as DomainData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            NSE · BSE · Powered by AI
          </div>
          <h1 className="text-3xl font-extrabold mb-2">{result.title ?? `Top 3 ${domain} Stocks`}</h1>
          <p className="text-slate-400 text-sm">
            Generated on {new Date(created_at as string).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="mt-4">
            <ShareButtons shareId={shareId} domain={domain as string} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="grid gap-4">
          {result.stocks?.map((stock, i) => (
            <StockCard key={stock.name} stock={stock} index={i} />
          ))}
        </div>
        {result.allocation && <AllocationBar allocation={result.allocation} />}

        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Run your own 3S search →
          </Link>
        </div>
      </div>
    </div>
  );
}
