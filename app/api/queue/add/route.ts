import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { type, payload } = await req.json();

    if (!type) {
      return NextResponse.json({ error: "Missing job type" }, { status: 400 });
    }

    await prisma.jobQueue.create({
      data: {
        type,
        payload,
        status: "pending",
      },
    });

    return NextResponse.json({ queued: true });
  } catch (err: any) {
    console.error("Queue add error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
