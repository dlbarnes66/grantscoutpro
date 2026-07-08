import { Worker } from "bullmq";
import { connection } from "../../lib/redis";
import { prisma } from "@/lib/prisma";

new Worker(
  "jobs",
  async job => {
    // your logic
  },
  { connection }
);
