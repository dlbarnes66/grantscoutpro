import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      method: "POST",
      workspaceId: params.id,
      query: Object.fromEntries(url.searchParams.entries()),
      body,
    });
  } catch (err: any) {
    console.error("CHAT POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
