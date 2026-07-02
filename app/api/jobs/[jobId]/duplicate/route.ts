import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        { error: "This job has no input to duplicate" },
        { status: 400 }
      );
    }

    // Create a new draft job
    const newJob = await prisma.job.create({
      data: {
        text: job.text + " (Draft Copy)",
        input: job.input,
        status: "draft", // ⭐ DRAFT MODE
      },
    });

    return NextResponse.json(
      { success: true, newJobId: newJob.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Duplicate job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
