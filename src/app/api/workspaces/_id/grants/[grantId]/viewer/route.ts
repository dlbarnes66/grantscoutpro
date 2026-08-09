import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; grantId: string } }
) {
  try {
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      method: "GET",
      workspaceId: params.id,
      grantId: params.grantId,
      viewer: "placeholder",
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("GRANT VIEWER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
