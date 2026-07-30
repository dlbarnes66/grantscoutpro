export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { docId, userId, content } = await req.json();

    if (!docId || !userId || !content) {
      return NextResponse.json(
        { error: "Missing docId, userId, or content" },
        { status: 400 }
      );
    }

    const snapshot = await prisma.documentSnapshot.create({
      data: {
        docId,
        userId,
        content,
      },
    });

    return NextResponse.json({ success: true, snapshot });
  } catch (err: any) {
    console.error("Document snapshot error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
