// app/api/realtime/presence/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { documentId, userId } = await req.json();

    if (!documentId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry = await prisma.documentPresence.upsert({
      where: { documentId_userId: { documentId, userId } },
      update: { lastSeen: new Date() },
      create: { documentId, userId, lastSeen: new Date() },
    });

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("REALTIME PRESENCE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update presence" },
      { status: 500 }
    );
  }
}
