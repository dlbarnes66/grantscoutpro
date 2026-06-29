import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { senderId, recipientId, content } = await req.json();

    if (!senderId || !recipientId || !content) {
      return NextResponse.json(
        { error: "Missing senderId, recipientId, or content" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content,
      },
    });

    return NextResponse.json({ message });
  } catch (err: any) {
    console.error("Send message error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
