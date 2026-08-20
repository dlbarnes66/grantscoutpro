import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(
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

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required." },
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

    // Fetch activity logs
    const activity = await prisma.workspaceDocumentActivity.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,        // edit, upload, rename, comment, ai, version, snapshot, acl, etc.
        description: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ activity }, { status: 200 });
  } catch (error: any) {
    console.error("Workspace document activity error:", error);
    return NextResponse.json(
      { error: "Failed to load document activity." },
      { status: 500 }
    );
  }
}
