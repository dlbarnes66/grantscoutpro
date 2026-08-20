import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET(
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  req: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const url = new URL(req.url);
    return NextResponse.json({
      success: true,
      method: "GET",
      workspaceId: params.id,
      documentId: params.documentId,
      file: "placeholder",
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("FILE GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
