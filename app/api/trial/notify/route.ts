import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        trialEndsAt: { not: null },
        isLocked: false
      },
      include: { users: true }
    });

    const now = new Date();

    for (const ws of workspaces) {
      const diff = ws.trialEndsAt!.getTime() - now.getTime();
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
        for (const user of ws.users) {
          console.log(`Send trial warning email to ${user.email} for workspace ${ws.id}`);
          // integrate your email provider here
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trial Notify Error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
