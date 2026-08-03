import Redis from "ioredis";
import { RedisOptions } from "bullmq";

// Prevent Redis from initializing during Next.js build
function isBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

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

  return new Redis(process.env.REDIS_URL);
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
