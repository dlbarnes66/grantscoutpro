import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized: No workspace found in session" },
        { status: 401 }
      );
    }

    const workspaceId = session.user.workspaceId;
    const documentId = params.id;

    const doc = await prisma.document.findUnique({
      where: { id: documentId, workspaceId },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        updatedAt: true,
      },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, document: doc });
  } catch (err) {
    console.error("Document viewer error:", err);
    return NextResponse.json(
      { error: "Failed to load document" },
      { status: 500 }
    );
  }
}
