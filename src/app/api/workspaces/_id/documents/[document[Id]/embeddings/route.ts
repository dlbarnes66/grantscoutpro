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

    // documentId is NOT unique in your schema.
    // So we must use findFirst instead of findUnique.
    const docEmbedding = await prisma.documentEmbedding.findFirst({
      where: { documentId }
    });

    return NextResponse.json({
      success: true,
      embedding: docEmbedding
    });
  } catch (err: any) {
    console.error("DOCUMENT EMBEDDING ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
