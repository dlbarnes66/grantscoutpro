// /app/api/queue/process/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function handleJob(job) {
  switch (job.jobType) {
    case "email.send":
      // Example: send email
      console.log("Sending email:", job.payload);
      break;

    case "ai.generateSummary":
      console.log("Generating AI summary:", job.payload);
      break;

    case "workspace.cleanup":
      console.log("Cleaning workspace:", job.payload);
      break;

    default:
      console.log("Unknown job type:", job.jobType);
  }
}

export async function POST() {
  try {
    const jobs = await prisma.queueJob.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    for (const job of jobs) {
      try {
        await prisma.queueJob.update({
          where: { id: job.id },
          data: { status: "processing" },
        });

        await handleJob(job);

        await prisma.queueJob.update({
          where: { id: job.id },
          data: { status: "completed" },
        });
      } catch (err) {
        console.error("Job Failed:", err);

        await prisma.queueJob.update({
          where: { id: job.id },
          data: {
            status: "failed",
          },
        });
      }
    }

    return NextResponse.json({ success: true, processed: jobs.length });
  } catch (error) {
    console.error("Queue Process Error:", error);
    return NextResponse.json({ error: "Failed to process jobs" }, { status: 500 });
  }
}
