import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      method: "GET",
      workspaceId: params.id,
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("WORKSPACE BASE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
