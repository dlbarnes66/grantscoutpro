import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const versions = await prisma.documentVersion.findMany({
      where: { docId },
      orderBy: { createdAt: "asc" },
      include: { user: true },
    });

    return NextResponse.json({ success: true, versions });
  } catch (err: any) {
    console.error("Document version meta error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
