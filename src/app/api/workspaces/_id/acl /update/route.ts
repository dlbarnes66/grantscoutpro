import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { _id: string; documentId: string } }
) {
  try {
    const user = await requireUser();

    const workspaceId = params._id;
    const documentId = params.documentId;

    const body = await req.json().catch(() => ({}));

    const targetUserId = body.userId;

    if (!workspaceId || !documentId || !targetUserId) {
      return NextResponse.json(
        {
          error:
            "workspaceId, documentId, and userId are required.",
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

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "You do not have permission to update ACL.",
        },
        {
          status: 403,
        }
      );
    }

    const updates = {
      canView: !!body.canView,
      canEdit: !!body.canEdit,
      canRunAI: !!body.canRunAI,
    };

    const acl =
      await prisma.documentAccess.upsert({
        where: {
          documentId_userId: {
            documentId,
            userId: targetUserId,
          },
        },
        update: updates,
        create: {
          documentId,
          userId: targetUserId,
          ...updates,
        },
      });

    return NextResponse.json(
      { acl },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ACL UPDATE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update ACL.",
      },
      {
        status: 500,
      }
    );
  }
}