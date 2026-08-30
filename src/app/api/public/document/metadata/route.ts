import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get("shareId");

  if (!shareId) {
    return NextResponse.json({ error: "shareId required" }, { status: 400 });
  }

  const share = await prisma.documentShare.findUnique({
    where: { id: shareId },
    select: {
      role: true,
      documentId: true
    }
  });

  if (!share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  const doc = await prisma.document.findUnique({
    where: { id: share.documentId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return NextResponse.json(doc);
}
