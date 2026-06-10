import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getOrCreateUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/feedback  { pickId, vote: 1 | -1 }
export async function POST(req: NextRequest) {
  const userId = await getOrCreateUserId();
  if (!userId) return NextResponse.json({ error: "Session error" }, { status: 500 });

  const { pickId, vote } = await req.json();
  if (!pickId || (vote !== 1 && vote !== -1)) {
    return NextResponse.json({ error: "pickId and vote (1 or -1) required" }, { status: 400 });
  }

  await sql`
    INSERT INTO pick_feedback (pick_id, user_id, vote)
    VALUES (${pickId}, ${userId}, ${vote})
    ON CONFLICT (pick_id, user_id) DO UPDATE SET vote = ${vote}
  `;

  return NextResponse.json({ ok: true });
}
