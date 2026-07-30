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
    snapshots: []
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; documentId: string }> }
) {
  const { workspaceId, documentId } = await context.params;
  const body = await request.json();

  return NextResponse.json({
    success: true,
    workspaceId,
    documentId,
    snapshot: body
  });
}
