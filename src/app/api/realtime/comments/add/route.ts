// /app/api/realtime/comments/add/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { workspaceId, userId, message } = await req.json();

    if (!workspaceId || !userId || !message) {
      return NextResponse.json(
        { error: "workspaceId, userId, and message are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        workspaceId,
        userId,
        message,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    console.log("Broadcast comment:", comment);

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Comment Add Error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
