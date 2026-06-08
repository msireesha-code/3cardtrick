import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import sql from "./db";

const COOKIE = "3s_session";

// Returns a DB user id for the current session, creating one if needed.
// Works for anonymous users — no auth required.
export async function getOrCreateUserId(): Promise<number | null> {
  try {
    const jar = await cookies();
    let sessionId = jar.get(COOKIE)?.value;

    if (!sessionId) {
      sessionId = randomUUID();
      jar.set(COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
    }

    const rows = await sql`
      INSERT INTO users (session_id)
      VALUES (${sessionId})
      ON CONFLICT (session_id) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `;
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function getUserId(): Promise<number | null> {
  try {
    const jar = await cookies();
    const sessionId = jar.get(COOKIE)?.value;
    if (!sessionId) return null;
    const rows = await sql`SELECT id FROM users WHERE session_id = ${sessionId} LIMIT 1`;
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}
