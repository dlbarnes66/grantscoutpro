export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { workspaceId, filename, mimeType, size, url, storage } = await req.json();

    if (!workspaceId || !filename || !mimeType || !size || !url || !storage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find workspace owned by the user
    let workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
    });

    // If none, find workspace where user is a member
    if (!workspace) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId },
        include: { workspace: true },
      });

      workspace = membership?.workspace ?? null;
    }

    if (!workspace) {
      return NextResponse.json(
        { error: "No workspace found for user" },
        { status: 404 }
      );
    }

    // Upload file record
    const file = await prisma.workspaceFile.create({
      data: {
        workspaceId: workspace.id,
        filename,
        mimeType,
        size,
        url,
        storage,
      },
    });

    return NextResponse.json({
      success: true,
      file,
    });
  } catch (err: any) {
    console.error("DOCUMENT UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
