import Redis from "ioredis";
import { RedisOptions } from "bullmq";

// Prevent Redis from initializing during Next.js build
function isBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

// Reused across calls -- checkRateLimit() now runs on most mutating
// requests (AI panels, manual search, workspace creation), so a fresh
// ioredis connection per call would leak connections under real
// traffic instead of reusing one.
let redisClient: Redis | null = null;

// Lazy Redis initializer
export function getRedis() {
  if (isBuild()) {
    console.warn("Skipping Redis during build.");
    return null;
  }

  if (!process.env.REDIS_URL) {
    console.warn("Redis URL missing — skipping Redis initialization.");
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on("error", (err) => {
      console.error("Redis client error:", err);
    });
  }

  return redisClient;
}

// Lazy BullMQ connection
export function getRedisConnection(): RedisOptions | null {
  if (isBuild()) {
    console.warn("Skipping BullMQ during build.");
    return null;
  }

  if (
    !process.env.REDIS_HOST ||
    !process.env.REDIS_PORT ||
    !process.env.REDIS_PASSWORD
  ) {
    console.warn("Redis connection env vars missing — skipping BullMQ.");
    return null;
  }

  return {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  };
}
