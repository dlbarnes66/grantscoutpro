import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jobQueue } from "@/lib/queue";

export async function POST(_req, { params }) {
  const { id } = params;

  try {
    // Load original job
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (!job.input) {
      return NextResponse.json(
        { error: "This job has no stored input and cannot be re-run" },
        { status: 400 }
      );
    }

    // Create a new job with same input
    const newJob = await prisma.job.create({
      data: {
        text: job.text,
        input: job.input,
        status: "queued",
      },
    });

    // Enqueue new job
   await jobQueue.add("process", {
     id: newJob.id,
      input: job.input,
    });

    return NextResponse.json(
      { success: true, newJobId: newJob.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Rerun job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
