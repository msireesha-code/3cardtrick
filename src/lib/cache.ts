// Redis cache for LLM results — skips the expensive AI call for repeated sectors
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env

let redis: import("@upstash/redis").Redis | null = null;

function getRedis() {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "replace_me") return null;
  const { Redis } = require("@upstash/redis");
  redis = new Redis({ url, token });
  return redis;
}

const TTL = 60 * 60 * 6; // 6 hours

export async function getCached(domain: string): Promise<unknown | null> {
  try {
    const r = getRedis();
    if (!r) return null;
    const key = `3s:${domain.toLowerCase().trim()}`;
    return await r.get(key);
  } catch {
    return null;
  }
}

export async function setCached(domain: string, data: unknown): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    const key = `3s:${domain.toLowerCase().trim()}`;
    await r.set(key, data, { ex: TTL });
  } catch {
    // cache failures are non-fatal
  }
}
