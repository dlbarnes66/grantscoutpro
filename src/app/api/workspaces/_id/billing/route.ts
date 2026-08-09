import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      method: "GET",
      workspaceId: params.id,
      billing: "placeholder",
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("WORKSPACE BILLING ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
