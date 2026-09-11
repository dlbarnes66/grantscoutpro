import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: check workspace + membership + document access
async function getWorkspaceAndDocument(
  workspaceId: string,
  documentId: string,
  userId: string
) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        where: { userId, status: "active" },
      },
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const isMember =
    workspace.ownerId === userId || workspace.members.length > 0;

  if (!isMember) {
    throw new Error("Access denied to workspace");
  }

  const document = await prisma.workspaceDocument.findUnique({
    where: { id: documentId },
    include: {
      accessList: {
        where: { userId },
      },
    },
  });

  if (!document || document.workspaceId !== workspaceId) {
    throw new Error("Document not found in workspace");
  }

  const hasDocumentAccess =
    document.accessList.length > 0 || workspace.ownerId === userId;

  if (!hasDocumentAccess) {
    throw new Error("Access denied to document");
  }

  return { workspace, document };
}

// GET — fetch a single workspace document
export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; documentId: string }> }
) {
    const params = await paramsPromise;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const documentId = params.documentId;

    const { document } = await getWorkspaceAndDocument(
      workspaceId,
      documentId,
      userId
    );

    return NextResponse.json(
      {
        id: document.id,
        workspaceId: document.workspaceId,
        title: document.title,
        content: document.content,
        sizeBytes: document.sizeBytes,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET document error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// PATCH — update title/content of a workspace document
export async function PATCH(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; documentId: string }> }
) {
    const params = await paramsPromise;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const documentId = params.documentId;

    const body = await req.json();
    const { title, content } = body as {
      title?: string;
      content?: string;
    };

    const { document } = await getWorkspaceAndDocument(
      workspaceId,
      documentId,
      userId
    );

    const updated = await prisma.workspaceDocument.update({
      where: { id: document.id },
      data: {
        title: title ?? document.title,
        content: content ?? document.content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        id: updated.id,
        workspaceId: updated.workspaceId,
        title: updated.title,
        content: updated.content,
        sizeBytes: updated.sizeBytes,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PATCH document error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to update document" },
      { status: 500 }
    );
  }
}

// DELETE — remove a workspace document
export async function DELETE(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; documentId: string }> }
) {
    const params = await paramsPromise;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const documentId = params.documentId;

    const { document } = await getWorkspaceAndDocument(
      workspaceId,
      documentId,
      userId
    );

    await prisma.workspaceDocument.delete({
      where: { id: document.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE document error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to delete document" },
      { status: 500 }
    );
  }
}
