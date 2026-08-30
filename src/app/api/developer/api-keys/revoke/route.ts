import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      method: "POST",
      revoked: body.key ?? null,
    });
  } catch (err: any) {
    console.error("REVOKE API KEY ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
