import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await context.params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("REQUEST CONTENT TYPE:");
    console.log(req.headers.get("content-type"));

    const body = await req.json();

    console.log("================================");
    console.log("BODY RECEIVED:", body);
    console.log("TITLE RECEIVED:", body?.title);
    console.log("TYPE:", typeof body?.title);
    console.log("================================");

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        { error: "Missing title" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const isOwner =
      workspace.ownerId === userId;

    const isAdmin =
      workspace.members.some(
        (m) =>
          m.userId === userId &&
          m.role === "admin"
      );

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const document =
      await prisma.workspaceDocument.create({
        data: {
          workspaceId,
          title,
          content: "",
        },
      });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error(
      "DOCUMENT CREATE ERROR:",
      error
    );

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