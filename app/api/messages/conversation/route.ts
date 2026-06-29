import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userA, userB } = await req.json();

    if (!userA || !userB) {
      return NextResponse.json(
        { error: "Missing userA or userB" },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userA, recipientId: userB },
          { senderId: userB, recipientId: userA },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error("Conversation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
