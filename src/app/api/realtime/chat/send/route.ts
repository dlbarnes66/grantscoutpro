import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/app/api/realtime/events/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspaceId, senderId, message } = await req.json();

    if (!workspaceId || !senderId || !message) {
      return NextResponse.json(
        { error: "workspaceId, senderId, and message are required" },
        { status: 400 }
      );
    }

    const chat = await prisma.chatMessage.create({
      data: {
        workspaceId,
        senderId,
        message,
      },
    });

    broadcast({
      type: "chat.message",
      workspaceId,
      payload: {
        id: chat.id,
        senderId,
        message: chat.message,
        createdAt: chat.createdAt,
      },
    });

    return NextResponse.json({ success: true, chat });
  } catch (err: any) {
    console.error("Chat Send Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
