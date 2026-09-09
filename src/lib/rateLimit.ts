import { getRedis } from "@/lib/redis";

// Atomic fixed-window counter via Redis INCR. The previous
// implementation did a separate GET then SET, which under concurrent
// requests could let more than `limit` requests through (two requests
// both read the same starting count and both compute count+1) --
// exactly the kind of race this function exists to prevent. INCR is
// atomic in Redis, so concurrent callers serialize correctly here.
export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  // Rate limiting is a safety net, not a feature the user is asking for -
  // it should never be the reason an AI panel crashes outright. Anything
  // that goes wrong here (Redis unreachable, a malformed REDIS_URL causing
  // ioredis's `new Redis(url)` to throw synchronously, a dropped
  // connection, etc.) fails OPEN, exactly like the "no Redis configured"
  // case below already does.
  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    console.error("Redis client construction failed — skipping rate limit for key:", key, err);
    return { allowed: true, remaining: limit };
  }

  if (!redis) {
    console.warn("Redis unavailable — skipping rate limit for key:", key);
    return { allowed: true, remaining: limit };
  }

  try {
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
  } catch (err) {
    console.error("Redis rate-limit check failed — allowing request through for key:", key, err);
    return { allowed: true, remaining: limit };
  }
}
