import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; grantId: string } }
) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      method: "POST",
      workspaceId: params.id,
      grantId: params.grantId,
      editor: "placeholder",
      body,
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("GRANT EDITOR ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
