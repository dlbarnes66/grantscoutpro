import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany();

    let queued = 0;

    for (const user of users) {
      await prisma.jobQueue.create({
        data: {
          type: "notification",
          payload: {
            userId: user.id,
            message: "Daily reminder: Check your grants and applications.",
          },
          status: "pending",
        },
      });

      queued++;
    }

    return NextResponse.json({ queued });
  } catch (err: any) {
    console.error("Daily scheduler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
