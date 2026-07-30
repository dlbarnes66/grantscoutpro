import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Fetch workspace files
    const files = await prisma.file.findMany({
      where: { workspaceId },
      select: {
        id: true,
        size: true,
        mimeType: true
      }
    });

    // Count documents
    const documentsCount = await prisma.document.count({
      where: { workspaceId }
    });

    const dashboard = {
      files,
      documents: documentsCount
    };

    return NextResponse.json({
      success: true,
      dashboard
    });
  } catch (err: any) {
    console.error("WORKSPACE DASHBOARD ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
