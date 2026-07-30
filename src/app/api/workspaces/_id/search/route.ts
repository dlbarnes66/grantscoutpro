import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Missing query" },
        { status: 400 }
      );
    }

    const embeddings = await prisma.workspaceEmbedding.findMany({
      where: { workspaceId }
    });

    return NextResponse.json({
      success: true,
      results: embeddings
    });
  } catch (err: any) {
    console.error("WORKSPACE SEARCH ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
