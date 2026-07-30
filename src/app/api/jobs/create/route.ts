import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing job ID" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (err: any) {
    console.error("JOB CREATE ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const job = await prisma.job.create({
      data: {
        userId: body.userId,
        status: body.status ?? "pending",
        text: body.text ?? "",
        input: body.input ?? {}
      }
    });

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error("JOB CREATE ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
