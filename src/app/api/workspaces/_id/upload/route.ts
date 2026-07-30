import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const body = await request.json();

    const { url, filename, mimeType, size, storage } = body;

    if (!url || !filename || !mimeType) {
      return NextResponse.json(
        { error: "Missing required file fields" },
        { status: 400 }
      );
    }

    const file = await prisma.workspaceFile.create({
      data: {
        workspaceId,
        url,
        filename,
        mimeType,
        size: size ?? 0,
        storage: storage ?? "local"
      }
    });

    return NextResponse.json({ success: true, file });
  } catch (err: any) {
    console.error("WORKSPACE FILE UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
