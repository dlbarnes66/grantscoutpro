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
    const body = await req.json();

    const {
      workspaceId,
      filename,
      mimeType,
      size,
      url,
      storage,
      documentId,
    } = body;

    if (!workspaceId || !filename || !mimeType || !size || !url || !storage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create file record using correct Prisma fields
    const file = await prisma.file.create({
      data: {
        workspaceId,
        userId,
        documentId: documentId ?? null,
        filename,     // ✔ correct field
        mimeType,     // ✔ correct field
        size,         // ✔ correct field
        url,          // ✔ correct field
        storage,      // ✔ correct field
      },
    });

    return NextResponse.json({
      success: true,
      file,
    });
  } catch (err: any) {
    console.error("FILE UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
