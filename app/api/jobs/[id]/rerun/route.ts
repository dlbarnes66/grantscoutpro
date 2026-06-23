import { prisma } from "@/lib/prisma";
import { grantQueue } from "../../../../../queue";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { id } = params;

  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!job.input) {
    return NextResponse.json(
      { error: "This job has no stored input and cannot be re-run" },
      { status: 400 }
    );
  }

  const newJob = await prisma.job.create({
    data: {
      text: job.text,
      input: job.input,
      status: "queued",
    },
  });

  await grantQueue.add("process", {
    id: newJob.id,
    input: job.input,
  });

  return NextResponse.json({
    success: true,
    newJobId: newJob.id,
  });
}
