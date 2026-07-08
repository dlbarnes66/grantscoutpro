export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET /api/jobs
export async function GET() {
  try {
    const { userId } = await auth(); // ✅ FIXED

    if (!userId) {
      return NextResponse.json({ jobs: [] });
    }

    const jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/jobs
export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // ✅ FIXED

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body?.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        text: body.text,
        status: "queued",
        userId,
      },
    });

    // Save search history
    await prisma.searchHistory.create({
      data: {
        userId,
        query: body.text,
        jobId: job.id,
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
