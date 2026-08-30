import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const newKey = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      method: "POST",
      newKey,
    });
  } catch (err: any) {
    console.error("ROTATE API KEY ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
