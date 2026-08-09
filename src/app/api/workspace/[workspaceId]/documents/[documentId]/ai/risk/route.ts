import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const url = new URL(req.url);

    const documentId = params.documentId || params.id || url.searchParams.get("documentId");
    const workspaceId = params.workspaceId || url.searchParams.get("workspaceId");

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId
    });
  } catch (err: any) {
    console.error("GET RISK ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const params = await context.params;
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    const documentId = params.documentId || params.id || body.documentId || url.searchParams.get("documentId");
    const workspaceId = params.workspaceId || body.workspaceId || url.searchParams.get("workspaceId");

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
      body
    });
  } catch (err: any) {
    console.error("POST RISK ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
