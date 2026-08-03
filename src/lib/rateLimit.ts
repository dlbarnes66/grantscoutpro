import { getRedis } from "@/lib/redis";

export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  const redis = getRedis();

  if (!redis) {
    console.warn("Redis unavailable during build — skipping rate limit.");
    return { allowed: true, remaining: limit };
  }

  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const current = await redis.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await redis.set(key, (count + 1).toString(), "EX", windowSeconds);

  return { allowed: true, remaining: limit - (count + 1) };
}
