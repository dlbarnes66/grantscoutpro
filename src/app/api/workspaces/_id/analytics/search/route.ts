import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params;
    const { query, resultCount, durationMs } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Missing query" },
        { status: 400 }
      );
    }

    const entry = await prisma.searchAnalytics.create({
      data: {
        workspaceId,
        query,
        resultCount: resultCount ?? 0,
        durationMs: durationMs ?? 0
      }
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("WORKSPACE SEARCH ANALYTICS ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
