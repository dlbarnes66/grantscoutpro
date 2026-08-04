import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  request: Request,
  context: { params: {} }
) {
  try {
    const url = new URL(request.url);

  const params = await (context as any).params;
    const documentId = url.searchParams.get("documentId");
    const workspaceId = url.searchParams.get("workspaceId");

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId
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
  request: Request,
  context: { params: {} }
) {
  try {
    const body = await request.json().catch(() => ({} as any));
    const url = new URL(request.url);

  const params = await (context as any).params;
    const documentId =
      body.documentId ||
      url.searchParams.get("documentId");

    const workspaceId =
      body.workspaceId ||
      url.searchParams.get("workspaceId");

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body
    });
  } catch (err: any) {
    console.error("POST ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
