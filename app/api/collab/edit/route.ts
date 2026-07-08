import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { docId, content } = await req.json();

    if (!docId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.collabDoc.update({
      where: { id: docId },
      data: { content },
    });

    return NextResponse.json({ updated });
  } catch (err: any) {
    console.error("Collab edit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
