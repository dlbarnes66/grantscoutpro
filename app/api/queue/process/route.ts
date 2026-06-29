import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function processJob(job: any) {
  switch (job.type) {
    case "email":
      console.log("Sending email:", job.payload);
      break;

    case "ai-summary":
      console.log("Generating AI summary:", job.payload);
      break;

    case "grant-import":
      console.log("Processing grant import:", job.payload);
      break;

    default:
      console.log("Unknown job type:", job.type);
  }
}

export async function GET() {
  try {
    const jobs = await prisma.jobQueue.findMany({
      where: { status: "pending" },
      take: 10,
    });

    for (const job of jobs) {
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: { status: "processing" },
      });

      await processJob(job);

      await prisma.jobQueue.update({
        where: { id: job.id },
        data: { status: "completed" },
      });
    }

    return NextResponse.json({ processed: jobs.length });
  } catch (err: any) {
    console.error("Queue process error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
