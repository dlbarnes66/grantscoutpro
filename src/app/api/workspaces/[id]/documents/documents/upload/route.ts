import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: { _id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const workspaceId = params._id;

    const membership =
      await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId,
        },
        select: {
          id: true,
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

    const formData = await req.formData();

    const file = formData.get(
      "file"
    ) as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "file is required.",
        },
        {
          status: 400,
        }
      );
    }

    const arrayBuffer =
      await file.arrayBuffer();

    const text = Buffer.from(
      arrayBuffer
    ).toString("utf8");

    const document =
      await prisma.workspaceDocument.create({
        data: {
          id: uuid(),
          workspaceId,
          title: file.name,
          content: text,
          sizeBytes: file.size,
        },
        select: {
          id: true,
          title: true,
          content: true,
          sizeBytes: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json(
      {
        document,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "Workspace document upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to upload document.",
      },
      {
        status: 500,
      }
    );
  }
}