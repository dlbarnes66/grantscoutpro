import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      where: {
        lastLogin: { lt: cutoff },
      },
    });

    let queued = 0;

    for (const user of users) {
      await prisma.jobQueue.create({
        data: {
          type: "notification",
          payload: {
            userId: user.id,
            message: "We miss you! New grants and updates are waiting.",
          },
          status: "pending",
        },
      });

      queued++;
    }

    return NextResponse.json({ queued });
  } catch (err: any) {
    console.error("Inactivity scheduler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
