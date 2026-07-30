export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; documentId: string } }
) {
  try {
    const { documentId } = params;

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        Embedding: true,
        File: true,
        documentEmbeddings: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (err: any) {
    console.error("DOCUMENT DETAIL ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
