import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET not set" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id        = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh   = new Webhook(webhookSecret);

  let evt: any;
  try {
    evt = wh.verify(body, { "svix-id": svix_id, "svix-timestamp": svix_timestamp, "svix-signature": svix_signature });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const { type, data } = evt;

  if (type === "user.created" || type === "user.updated") {
    const email = data.email_addresses?.[0]?.email_address ?? "";
    await sql`
      INSERT INTO users (clerk_id, email, tier)
      VALUES (${data.id}, ${email}, 'free')
      ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()
    `;
  }

  if (type === "user.deleted") {
    await sql`DELETE FROM users WHERE clerk_id = ${data.id}`;
  }

  return NextResponse.json({ received: true });
}
