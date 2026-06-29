import { redis } from "@/lib/redis";

export async function rateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
}) {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / 1000 / windowSeconds)}`;

  const current = await redis.incr(windowKey);

  if (current === 1) {
    await redis.expire(windowKey, windowSeconds);
  }

  const allowed = current <= limit;

  return {
    allowed,
    current,
    limit,
    windowSeconds,
  };
}
