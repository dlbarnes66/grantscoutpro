import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { docId, content } = await req.json();

    if (!docId || !content) {
      return NextResponse.json(
        { error: "Missing docId or content" },
        { status: 400 }
      );
    }

    const snapshot = await prisma.documentSnapshot.create({
      data: {
        docId,
        content,
      },
    });

    return NextResponse.json({ snapshot });
  } catch (err: any) {
    console.error("Snapshot error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
