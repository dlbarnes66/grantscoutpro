// lib/queue.ts

import { Queue } from "bullmq";

export const jobQueue = new Queue("jobs", {
  connection: {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD!,
  },
});
