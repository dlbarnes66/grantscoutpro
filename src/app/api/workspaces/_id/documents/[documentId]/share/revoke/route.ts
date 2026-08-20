import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { _id: string; documentId: string } }
) {
  try {
    const user = await requireUser(req);
    const workspaceId = params._id;
    const documentId = params.documentId;

    const body = await req.json().catch(() => ({}));

    const shareId =
      typeof body.shareId === "string" ? body.shareId.trim() : null;

    if (!workspaceId || !documentId) {
      return NextResponse.json(
        { error: "workspaceId and documentId are required." },
        { status: 400 }
      );
    }

    if (!shareId) {
      return NextResponse.json(
        { error: "shareId is required." },
        { status: 400 }
      );
    }

    // Ensure user is a workspace member
    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: user.id },
      select: { role: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You do not have access to this workspace." },
        { status: 403 }
      );
    }

    // Only owner/admin can revoke shares
    if (!["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "You do not have permission to revoke shares." },
        { status: 403 }
      );
    }

    // Ensure document exists
    const document = await prisma.workspaceDocument.findFirst({
      where: { id: documentId, workspaceId },
      select: { id: true }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // Ensure share exists
    const share = await prisma.documentShare.findFirst({
      where: { id: shareId, documentId },
      select: {
        id: true,
        type: true,
        email: true,
        role: true
      }
    });

    if (!share) {
      return NextResponse.json(
        { error: "Share entry not found." },
        { status: 404 }
      );
    }

    // Delete share entry
    await prisma.documentShare.delete({
      where: { id: shareId }
    });

    // Log activity
    await prisma.workspaceDocumentActivity.create({
      data: {
        documentId,
        userId: user.id,
        type: "share_revoke",
        description:
          share.type === "public"
            ? "Public share link revoked"
            : `Invite revoked for ${share.email}`
      }
    });

    return NextResponse.json(
      { success: true, revokedId: shareId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Share Revoke error:", error);
    return NextResponse.json(
      { error: "Failed to revoke share." },
      { status: 500 }
    );
  }
}
