import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET(request: NextRequest, context: any) {
  req: Request,
  context: { params: {} }
) {
  try {
    const url = new URL(req.url);

  const params = await (context as any).params;
    const documentId =
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

    const workspaceId =
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.workspaceId ||
      url.searchParams.get("workspaceId");

    // TODO: implement real GET logic here

    return NextResponse.json({
      success: true,
      method: "GET",
      documentId,
      workspaceId,
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
  req: Request,
  context: { params: {} }
) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const url = new URL(req.url);

  const params = await (context as any).params;
    const documentId =
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

    const workspaceId =
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
  const params = await (context as any).params;
      params.workspaceId ||
      body.workspaceId ||
      url.searchParams.get("workspaceId");

    // TODO: implement real POST logic here

    return NextResponse.json({
      success: true,
      method: "POST",
      documentId,
      workspaceId,
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

