import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = params.id;

    // Reset job status to queued
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "queued" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Retry job error:", err);
    return NextResponse.json(
      { error: "Failed to retry job" },
      { status: 500 }
    );
  }
}
