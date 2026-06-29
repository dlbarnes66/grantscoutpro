import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { docId, userId, patch } = await req.json();

    if (!docId || !userId || !patch) {
      return NextResponse.json(
        { error: "Missing docId, userId, or patch" },
        { status: 400 }
      );
    }

    const entry = await prisma.documentPatch.create({
      data: {
        docId,
        userId,
        patch,
      },
    });

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Patch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
