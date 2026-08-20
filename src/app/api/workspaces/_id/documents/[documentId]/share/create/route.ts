import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { randomUUID } from "crypto";

const VALID_ROLES = ["viewer", "commenter", "editor"];

export async function POST(
  req: NextRequest,
  { params }: { params: { _id: string; documentId: string } }
) {
  try {
    const user = await requireUser(req);
    const workspaceId = params._id;
    const documentId = params.documentId;

    const body = await req.json().catch(() => ({}));

    const type =
      typeof body.type === "string" ? body.type.trim() : null; // "invite" | "public"
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
    const role =
      typeof body.role === "string" ? body.role.trim() : null;

    if (!workspaceId || !documentId) {
      return NextResponse.json(
        { error: "workspaceId and documentId are required." },
        { status: 400 }
      );
    }

    if (!type || !["invite", "public"].includes(type)) {
      return NextResponse.json(
        { error: "type must be 'invite' or 'public'." },
        { status: 400 }
      );
    }

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `role must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    if (type === "invite" && !email) {
      return NextResponse.json(
        { error: "email is required for invite shares." },
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

    // Only owner/admin can share documents
    if (!["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "You do not have permission to share this document." },
        { status: 403 }
      );
    }

    // Ensure document exists
    const document = await prisma.workspaceDocument.findFirst({
      where: { id: documentId, workspaceId },
      select: { id: true, name: true }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 }
      );
    }

    // PUBLIC SHARE
    if (type === "public") {
      // Check if public share already exists
      const existingPublic = await prisma.documentShare.findFirst({
        where: { documentId, type: "public" },
        select: { id: true }
      });

      if (existingPublic) {
        return NextResponse.json(
          { error: "Public share already exists for this document." },
          { status: 409 }
        );
      }

      const token = randomUUID();

      const share = await prisma.documentShare.create({
        data: {
          documentId,
          type: "public",
          role,
          token
        },
        select: {
          id: true,
          type: true,
          role: true,
          token: true
        }
      });

      await prisma.workspaceDocumentActivity.create({
        data: {
          documentId,
          userId: user.id,
          type: "share_create",
          description: "Public share link created"
        }
      });

      return NextResponse.json({ share }, { status: 201 });
    }

    // INVITE SHARE
    // Check if invite already exists
    const existingInvite = await prisma.documentShare.findFirst({
      where: { documentId, email },
      select: { id: true }
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "This user is already invited to the document." },
        { status: 409 }
      );
    }

    const share = await prisma.documentShare.create({
      data: {
        documentId,
        type: "invite",
        email,
        role
      },
      select: {
        id: true,
        type: true,
        email: true,
        role: true
      }
    });

    await prisma.workspaceDocumentActivity.create({
      data: {
        documentId,
        userId: user.id,
        type: "share_create",
        description: `Invite sent to ${email}`
      }
    });

    return NextResponse.json({ share }, { status: 201 });
  } catch (error) {
    console.error("Share Create error:", error);
    return NextResponse.json(
      { error: "Failed to create share." },
      { status: 500 }
    );
  }
}
