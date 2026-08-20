import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    const user = await requireUser(req);
    const workspaceId = params._id;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const documentId =
      typeof body.documentId === "string" ? body.documentId.trim() : null;

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required." },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};

    if (typeof body.name === "string") {
      updates.name = body.name.trim();
    }

    if (typeof body.type === "string") {
      updates.type = body.type.trim();
    }

    if (typeof body.tags === "object" && Array.isArray(body.tags)) {
      updates.tags = body.tags;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    // Ensure user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You do not have access to this workspace." },
        { status: 403 }
      );
    }

    // Ensure document exists and belongs to this workspace
    const document = await prisma.workspaceDocument.findFirst({
      where: {
        id: documentId,
        workspaceId,
      },
      select: { id: true },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // Apply updates
    const updated = await prisma.workspaceDocument.update({
      where: { id: documentId },
      data: updates,
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        url: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ document: updated }, { status: 200 });
  } catch (error: any) {
    console.error("Workspace document update error:", error);
    return NextResponse.json(
      { error: "Failed to update document." },
      { status: 500 }
    );
  }
}
