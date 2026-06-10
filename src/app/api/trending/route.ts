import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`
    SELECT
      LOWER(TRIM(domain)) AS domain,
      COUNT(*) AS count
    FROM searches
    WHERE created_at > NOW() - INTERVAL '7 days'
    GROUP BY LOWER(TRIM(domain))
    ORDER BY count DESC
    LIMIT 10
  `;
  return NextResponse.json({ trending: rows });
}
