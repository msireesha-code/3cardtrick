import { MetadataRoute } from "next";

const BASE = "https://3cardtrick.vercel.app";

const SECTORS = [
  "defense", "pharma", "fintech", "ev", "renewable-energy",
  "psu-banks", "it-services", "fmcg", "infrastructure", "textiles",
  "banking", "chemicals", "real-estate", "aviation", "telecom",
  "auto", "metals", "insurance", "logistics",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const static_pages = [
    { url: BASE, priority: 1.0 },
    { url: `${BASE}/trending`, priority: 0.8 },
    { url: `${BASE}/disclaimer`, priority: 0.5 },
    { url: `${BASE}/methodology`, priority: 0.5 },
    { url: `${BASE}/widget`, priority: 0.4 },
  ].map(p => ({ ...p, lastModified: new Date(), changeFrequency: "weekly" as const }));

  const sector_pages = SECTORS.map(s => ({
    url: `${BASE}/sector/${s}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...static_pages, ...sector_pages];
}
