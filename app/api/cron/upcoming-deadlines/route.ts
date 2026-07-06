import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const upcoming = new Date();
    upcoming.setDate(now.getDate() + 7);

    const grants = await prisma.grant.findMany({
      where: {
        deadline: {
          gte: now,
          lte: upcoming,
        },
      },
    });

    for (const grant of grants) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: grant.workspaceId },
        include: { members: true },
      });

      if (!workspace || workspace.members.length === 0) continue;

      for (const member of workspace.members) {
        await prisma.notification.create({
          data: {
            userId: member.userId,
            type: "deadline",
            data: {
              title: grant.title,
              deadline: grant.deadline,
              workspaceId: grant.workspaceId,
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Upcoming deadlines cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
