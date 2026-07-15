import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { embedDocument } from "@/lib/embeddings";

export async function POST(req: Request) {
  try {
    const { workspaceId, userId, title, content } = await req.json();

    if (!workspaceId || !userId || !content) {
      return NextResponse.json(
        { error: "workspaceId, userId, and content are required" },
        { status: 400 }
      );
    }

    // 1. Create the document
    const document = await prisma.document.create({
      data: {
        workspaceId,
        userId,
        title: title || "Untitled Document",
        content,
      },
    });

    // 2. Automatically embed the document
    await embedDocument(document.id, workspaceId, JSON.stringify(content));

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Document creation error:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
