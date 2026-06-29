import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { versionId, documentId, userId } = await req.json();

    if (!versionId || !documentId || !userId) {
      return NextResponse.json(
        { error: "Missing versionId, documentId, or userId" },
        { status: 400 }
      );
    }

    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const restored = await prisma.documentVersion.create({
      data: {
        documentId,
        userId,
        content: version.content,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ restored });
  } catch (err: any) {
    console.error("Version restore error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
