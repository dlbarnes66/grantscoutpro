import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { id } = params;

  // Load original job
  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
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

  return NextResponse.json({
    success: true,
    newJobId: newJob.id,
  });
}
