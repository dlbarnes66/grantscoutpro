import { Queue, Worker } from "bullmq";
import { connection } from "../shared/redis.js";

export const grantQueue = new Queue("grantQueue", {
  connection,
});

// Example worker (adjust if your worker logic is different)
export const grantWorker = new Worker(
  "grantQueue",
  async (job) => {
    console.log("Processing job:", job.id, job.data);
    // Your job logic here
    return { success: true };
  },
  { connection }
);
