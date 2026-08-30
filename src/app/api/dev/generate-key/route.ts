import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return NextResponse.json({
      success: true,
      method: "GET",
      message: "Ready to generate API key",
    });
  } catch (err: any) {
    console.error("GET GENERATE KEY ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));

    const key = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      method: "POST",
      key,
      body,
    });
  } catch (err: any) {
    console.error("POST GENERATE KEY ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
