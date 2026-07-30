import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const files = await prisma.workspaceFile.findMany({
      where: { workspaceId },
      select: {
        id: true,
        mimeType: true,
        size: true,
        filename: true,
        url: true
      }
    });

    return NextResponse.json({
      success: true,
      files
    });
  } catch (err: any) {
    console.error("WORKSPACE DOCUMENTS ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
