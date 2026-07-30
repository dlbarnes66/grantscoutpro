export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { versionId, userId } = await req.json();

    if (!versionId || !userId) {
      return NextResponse.json(
        { error: "Missing versionId or userId" },
        { status: 400 }
      );
    }

    // Fetch the version being restored
    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    // Create a new version entry representing the restore action
    const restored = await prisma.documentVersion.create({
      data: {
        docId: version.docId,        // FIXED
        userId,                      // Provided by request
        content: version.content,    // Copy content
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, restored });
  } catch (err: any) {
    console.error("Document restore error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
