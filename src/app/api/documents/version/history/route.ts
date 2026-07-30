export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");

    if (!docId) {
      return NextResponse.json(
        { error: "Missing docId" },
        { status: 400 }
      );
    }

    const history = await prisma.documentVersion.findMany({
      where: { docId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json({ success: true, history });
  } catch (err: any) {
    console.error("Document version history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
