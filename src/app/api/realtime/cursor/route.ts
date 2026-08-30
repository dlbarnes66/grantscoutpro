// /app/api/realtime/cursor/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { workspaceId, userId, x, y } = await req.json();

    if (!workspaceId || !userId || x === undefined || y === undefined) {
      return NextResponse.json(
        { error: "workspaceId, userId, x, and y are required" },
        { status: 400 }
      );
    }

    const cursor = await prisma.cursor.upsert({
      where: { id: `${workspaceId}-${userId}` },
      update: { x, y },
      create: {
        id: `${workspaceId}-${userId}`,
        workspaceId,
        userId,
        x,
        y,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    console.log("Broadcast cursor:", cursor);

    return NextResponse.json({ success: true, cursor });
  } catch (error) {
    console.error("Cursor Update Error:", error);
    return NextResponse.json({ error: "Failed to update cursor" }, { status: 500 });
  }
}
