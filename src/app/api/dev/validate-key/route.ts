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
      message: "Validation endpoint ready",
    });
  } catch (err: any) {
    console.error("GET VALIDATE KEY ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));

    const valid = typeof body.key === "string" && body.key.length > 0;

    return NextResponse.json({
      success: true,
      method: "POST",
      valid,
      body,
    });
  } catch (err: any) {
    console.error("POST VALIDATE KEY ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
