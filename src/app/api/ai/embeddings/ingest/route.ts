export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const { documentId, workspaceId, content, embedding } = await req.json();

    if (!documentId || !workspaceId || !content || !embedding) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const record = await prisma.documentEmbedding.upsert({
      where: { id: documentId },   // ✔ FIXED — must use id
      update: {
        content,
        embedding,
      },
      create: {
        id: documentId,            // ✔ FIXED — id is the unique key
        documentId,
        workspaceId,
        content,
        embedding,
      },
    });

    return NextResponse.json({
      success: true,
      embedding: record,
    });
  } catch (err: any) {
    console.error("EMBEDDING INGEST ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
