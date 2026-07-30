import { Worker } from "bullmq";
import { getRedisConnection } from "../../lib/redis";

// Prevent worker from running during Next.js build
if (process.env.NEXT_PHASE !== "phase-production-build") {
  const connection = getRedisConnection();

  if (connection) {
    new Worker(
      "jobs",
      async (job) => {
        console.log("Processing job:", job.id);
        // job logic here
      },
      { connection }
    );
  } else {
    console.warn("Redis connection unavailable — worker not started.");
  }
}
