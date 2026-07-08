// app/api/realtime/comments/add/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { documentId, userId, text, selection } = await req.json();

    if (!documentId || !userId || !text) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry = await prisma.documentComment.create({
      data: {
        documentId,
        userId,
        text,
        selection,
      },
    });

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("REALTIME COMMENT ADD ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
