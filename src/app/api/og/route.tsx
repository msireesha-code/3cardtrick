import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import sql from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const shareId = new URL(req.url).searchParams.get("id");

  let domain = "Indian Stocks";
  let stocks: string[] = [];

  if (shareId) {
    try {
      const rows = await sql`SELECT domain, result_json FROM searches WHERE share_id = ${shareId} LIMIT 1`;
      if (rows[0]) {
        domain = rows[0].domain;
        const result = rows[0].result_json as { stocks?: { name: string }[] };
        stocks = result?.stocks?.map((s: { name: string }) => s.name) ?? [];
      }
    } catch {}
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #312e81 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "100px",
              padding: "8px 20px",
              color: "#93c5fd",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            NSE · BSE · Powered by AI
          </div>
        </div>

        <div style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "12px", opacity: 0.6 }}>
          3S Stock Finder
        </div>

        <div style={{ color: "#ffffff", fontSize: "52px", fontWeight: 800, lineHeight: 1.1, marginBottom: "40px", textTransform: "capitalize" }}>
          Top 3 picks for<br />
          <span style={{ color: "#60a5fa" }}>{domain}</span>
        </div>

        {stocks.length > 0 && (
          <div style={{ display: "flex", gap: "16px" }}>
            {stocks.map((name, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "16px",
                  padding: "16px 24px",
                  color: "#e2e8f0",
                  fontSize: "20px",
                  fontWeight: 600,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                <div style={{ color: ["#fbbf24", "#94a3b8", "#d97706"][i], fontSize: "13px", marginBottom: "6px", fontWeight: 700 }}>
                  {["#1 TOP PICK", "#2 STRONG HOLD", "#3 CONSIDER"][i]}
                </div>
                {name}
              </div>
            ))}
          </div>
        )}

        <div style={{ position: "absolute", bottom: "40px", right: "60px", color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>
          3s-stock-finder.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
