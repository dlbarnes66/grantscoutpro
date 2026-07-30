import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; documentId: string }> }
) {
  const { workspaceId, documentId } = await context.params;

  return NextResponse.json({
    success: true,
    workspaceId,
    documentId,
    versions: []
  });
}
