import { getRedis } from "./redis";

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();

  if (!redis) {
    console.warn("Redis unavailable during build — skipping cacheGet.");
    return null;
  }

  const raw = await redis.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  const redis = getRedis();

  if (!redis) {
    console.warn("Redis unavailable during build — skipping cacheSet.");
    return;
  }

  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}
