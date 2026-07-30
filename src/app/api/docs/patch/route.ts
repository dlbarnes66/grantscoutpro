export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




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

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("Document patch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
