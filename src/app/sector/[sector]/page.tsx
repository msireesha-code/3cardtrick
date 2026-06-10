import { Suspense } from "react";
import StockFinder from "@/components/StockFinder";

const TOP_SECTORS = [
  "defense", "pharma", "fintech", "ev", "renewable-energy",
  "psu-banks", "it-services", "fmcg", "infrastructure", "textiles",
  "banking", "chemicals", "real-estate", "aviation", "telecom",
  "auto", "metals", "fmcg", "insurance", "logistics",
];

export async function generateStaticParams() {
  return TOP_SECTORS.map((sector) => ({ sector }));
}

export async function generateMetadata({ params }: { params: Promise<{ sector: string }> }) {
  const { sector } = await params;
  const name = sector.replace(/-/g, " ");
  return {
    title: `Top 3 ${name} stocks — 3S Stock Finder`,
    description: `AI-powered NSE/BSE stock picks for the Indian ${name} sector. Updated live.`,
  };
}

export default async function SectorPage({ params }: { params: Promise<{ sector: string }> }) {
  const { sector } = await params;
  const q = sector.replace(/-/g, " ");
  return (
    <Suspense>
      <StockFinder preloadQuery={q} />
    </Suspense>
  );
}
