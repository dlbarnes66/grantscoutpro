export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { userId, subject, body } = await req.json();

    if (!userId || !subject || !body) {
      return NextResponse.json(
        { error: "Missing userId, subject, or body" },
        { status: 400 }
      );
    }

    await prisma.jobQueue.create({
      data: {
        type: "email",
        payload: { userId, subject, body },
        status: "pending",
      },
    });

    return NextResponse.json({ queued: true });
  } catch (err: any) {
    console.error("Email queue error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
