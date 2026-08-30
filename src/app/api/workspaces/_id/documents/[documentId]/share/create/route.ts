import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const VALID_ROLES = [
  "viewer",
  "commenter",
  "editor"
];

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      _id: string;
      documentId: string;
    };
  }
) {
  try {
    const user = await requireUser();

    const workspaceId = params._id;
    const documentId = params.documentId;

    const body = await req
      .json()
      .catch(() => ({}));

    const targetUserId =
      typeof body.userId === "string"
        ? body.userId
        : null;

    const role =
      typeof body.role === "string"
        ? body.role.trim()
        : "viewer";

    if (!workspaceId || !documentId) {
      return NextResponse.json(
        {
          error:
            "workspaceId and documentId are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !role ||
      !VALID_ROLES.includes(role)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid role.",
        },
        {
          status: 400,
        }
      );
    }

    if (!targetUserId) {
      return NextResponse.json(
        {
          error:
            "userId is required.",
        },
        {
          status: 400,
        }
      );
    }

    const membership =
      await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: user.id,
        },
        select: {
          role: true,
        },
      });

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "You do not have access to this workspace.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      !["owner", "admin"].includes(
        membership.role
      )
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to share this document.",
        },
        {
          status: 403,
        }
      );
    }

    const document =
      await prisma.workspaceDocument.findFirst({
        where: {
          id: documentId,
          workspaceId,
        },
        select: {
          id: true,
          title: true,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          error:
            "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    const existing =
      await prisma.documentShare.findFirst({
        where: {
          documentId,
          userId: targetUserId,
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Share already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const share =
      await prisma.documentShare.create({
        data: {
          documentId,
          userId: targetUserId,
          role,
        },
        select: {
          id: true,
          documentId: true,
          userId: true,
          role: true,
          createdAt: true,
        },
      });

    return NextResponse.json(
      {
        share,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Share Create error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create share.",
      },
      {
        status: 500,
      }
    );
  }
}