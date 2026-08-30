// /app/api/realtime/presence/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { workspaceId, userId, status } = await req.json();

    if (!workspaceId || !userId || !status) {
      return NextResponse.json(
        { error: "workspaceId, userId, and status are required" },
        { status: 400 }
      );
    }

    const presence = await prisma.presence.upsert({
      where: { id: `${workspaceId}-${userId}` },
      update: { status },
      create: {
        id: `${workspaceId}-${userId}`,
        workspaceId,
        userId,
        status,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    console.log("Broadcast presence:", presence);

    return NextResponse.json({ success: true, presence });
  } catch (error) {
    console.error("Presence Update Error:", error);
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
  }
}
