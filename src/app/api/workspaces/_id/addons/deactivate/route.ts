import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      method: "POST",
      workspaceId: params.id,
      addon: "deactivate",
      query: Object.fromEntries(url.searchParams.entries()),
      body,
    });
  } catch (err: any) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
