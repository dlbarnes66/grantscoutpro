import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      method: "POST",
      workspaceId: params.id,
      documentId: params.documentId,
      presence: "placeholder",
      body,
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("PRESENCE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
