import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      method: "POST",
      workspaceId: params.id,
      grantsCompare: "placeholder",
      body,
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("WORKSPACE GRANTS COMPARE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
