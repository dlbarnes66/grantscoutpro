import { Queue, Job } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const grantQueue = new Queue("grantQueue", { connection });

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Missing jobId parameter" }),
        { status: 400 }
      );
    }

    const job = await Job.fromId(grantQueue, jobId);

    if (!job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404 }
      );
    }

    const state = await job.getState();
    const result = job.returnvalue || null;

    return new Response(
      JSON.stringify({
        jobId,
        state,
        result,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Job status error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch job status" }),
      { status: 500 }
    );
  }
}
