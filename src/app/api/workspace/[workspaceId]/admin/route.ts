import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string,string>> }
) {
  try {
    const params = await context.params;

    const workspaceId = params.workspaceId;

    return NextResponse.json({
      success: true,
      method: "GET",
      workspaceId
    });
  } catch (err: any) {
    console.error("GET ADMIN ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string,string>> }
) {
  try {
    const params = await context.params;
    const body = await req.json().catch(() => ({}));

    const workspaceId = params.workspaceId || body.workspaceId;

    return NextResponse.json({
      success: true,
      method: "POST",
      workspaceId,
      body
    });
  } catch (err: any) {
    console.error("POST ADMIN ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
