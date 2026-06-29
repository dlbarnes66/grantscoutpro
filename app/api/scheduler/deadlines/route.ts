import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

    const grants = await prisma.grant.findMany({
      where: {
        deadline: {
          gte: now,
          lte: soon,
        },
      },
      include: {
        savedBy: true,
      },
    });

    let queued = 0;

    for (const grant of grants) {
      for (const user of grant.savedBy) {
        await prisma.jobQueue.create({
          data: {
            type: "notification",
            payload: {
              userId: user.id,
              message: `Deadline approaching: ${grant.title} closes soon.`,
            },
            status: "pending",
          },
        });

        queued++;
      }
    }

    return NextResponse.json({ queued });
  } catch (err: any) {
    console.error("Deadline scheduler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
