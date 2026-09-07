import { getRedis } from "@/lib/redis";

// Atomic fixed-window counter via Redis INCR. The previous
// implementation did a separate GET then SET, which under concurrent
// requests could let more than `limit` requests through (two requests
// both read the same starting count and both compute count+1) --
// exactly the kind of race this function exists to prevent. INCR is
// atomic in Redis, so concurrent callers serialize correctly here.
export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  const redis = getRedis();

  if (!redis) {
    console.warn("Redis unavailable — skipping rate limit for key:", key);
    return { allowed: true, remaining: limit };
  }

  const count = await redis.incr(key);

  // Only the request that created the key sets its expiry, so later
  // increments within the window don't keep pushing the reset back out.
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - count };
}
