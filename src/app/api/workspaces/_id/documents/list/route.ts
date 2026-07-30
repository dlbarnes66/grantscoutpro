import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;

    const documents = await prisma.workspaceDocument.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ success: true, documents });
  } catch (err: any) {
    console.error("WORKSPACE DOCUMENT LIST ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
