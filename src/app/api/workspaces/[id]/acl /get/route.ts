import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { _id: string; documentId: string } }
) {
  try {
    const user = await requireUser();

    const workspaceId = params._id;
    const documentId = params.documentId;

    if (!workspaceId || !documentId) {
      return NextResponse.json(
        {
          error: "workspaceId and documentId are required.",
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

    const access =
      await prisma.documentAccess.findFirst({
        where: {
          documentId,
          userId: user.id,
        },
        select: {
          canView: true,
          canEdit: true,
          canRunAI: true,
        },
      });

    return NextResponse.json(
      {
        permissions:
          access ?? {
            canView: true,
            canEdit: false,
            canRunAI: false,
          },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ACL GET error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load ACL.",
      },
      {
        status: 500,
      }
    );
  }
}