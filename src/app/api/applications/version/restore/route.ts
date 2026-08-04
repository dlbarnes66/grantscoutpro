import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  request: NextRequest,
  context: any
) {
  try {
    const url = new URL(request.url);
    const params = await context.params;

    const resolvedDocumentId =
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.documentId ||
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.grantId ||
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.id ||
      url.searchParams.get("documentId");

    const resolvedWorkspaceId =
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.workspaceId ||
      url.searchParams.get("workspaceId");

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId: resolvedDocumentId ?? "",
      workspaceId: resolvedWorkspaceId ?? "",
    });
  } catch (err: any) {
    console.error("GET ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: any) {
  request: NextRequest,
  context: any
) {
  try {
    const body = await request.json().catch(() => ({} as any));
    const url = new URL(request.url);
    const params = await context.params;

    const resolvedDocumentId =
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.documentId ||
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.grantId ||
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.id ||
      body.documentId ||
      url.searchParams.get("documentId");

    const resolvedWorkspaceId =
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.workspaceId ||
      body.workspaceId ||
      url.searchParams.get("workspaceId");

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId: resolvedDocumentId ?? "",
      workspaceId: resolvedWorkspaceId ?? "",
      body,
    });
  } catch (err: any) {
    console.error("POST ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
