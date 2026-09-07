import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
      documentId: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const workspaceId = params.id;
    const documentId = params.documentId;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: { where: { userId } },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const isMember =
      workspace.ownerId === userId || workspace.members.length > 0;

    if (!isMember) {
      return NextResponse.json(
        { error: "Access denied to workspace" },
        { status: 403 }
      );
    }

    const document = await prisma.workspaceDocument.findFirst({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found in workspace" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workspaceId: document.workspaceId,
      documentId: document.id,
      title: document.title,
      content: document.content ?? "",
      updatedAt: document.updatedAt,
    });
  } catch (error) {
    console.error("WORKSPACE DOCUMENT VIEWER ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
