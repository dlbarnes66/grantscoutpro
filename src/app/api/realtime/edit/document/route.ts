import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { documentId, workspaceId, delta, fullContent } = await req.json();

    if (!documentId || !workspaceId) {
      return NextResponse.json(
        { error: "documentId and workspaceId are required" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    let updatedContent = doc.content;

    // If full content is provided, replace entirely
    if (fullContent !== undefined) {
      updatedContent = fullContent;
    }

    // If delta is provided, merge only if both sides are valid delta objects
    if (delta && typeof delta === "object" && "ops" in delta) {
      const existingOps = Array.isArray(
  (updatedContent as any)?.ops
)
  ? (updatedContent as any).ops
  : [];

updatedContent = {
  ops: [
    ...existingOps,
    ...(Array.isArray(delta.ops)
      ? delta.ops
      : []),
  ],
};
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        content: updatedContent,
      },
    });

    console.log("Broadcast document update:", {
      documentId,
      workspaceId,
      userId,
      updatedAt: updated.updatedAt,
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: any) {
    console.error("DOCUMENT EDIT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
