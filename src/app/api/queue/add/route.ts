// /app/api/queue/add/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { workspaceId, jobType, payload } = await req.json();

    if (!workspaceId || !jobType) {
      return NextResponse.json(
        { error: "workspaceId and jobType are required" },
        { status: 400 }
      );
    }

    const job = await prisma.queueJob.create({
      data: {
        workspaceId,
        jobType,
        payload,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Queue Add Error:", error);
    return NextResponse.json({ error: "Failed to add job" }, { status: 500 });
  }
}
