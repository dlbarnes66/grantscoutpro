import { redis } from "./redis";

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: any, ttlSeconds = 3600) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}
