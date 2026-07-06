// app/api/realtime/chat/send/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { documentId, userId, message } = await req.json();

    if (!documentId || !userId || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ⭐ FIX: Use the correct Prisma model (DocumentMessage)
    const entry = await prisma.documentMessage.create({
      data: {
        documentId,
        userId,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("REALTIME CHAT SEND ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
