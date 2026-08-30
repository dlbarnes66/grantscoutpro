import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ----------------------
// GET
// ----------------------
export async function GET(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { params } = context;
    const url = new URL(req.url);

    return NextResponse.json({
      success: true,
      method: "GET",
      params,
      query: Object.fromEntries(url.searchParams.entries()),
    });
  } catch (err: any) {
    console.error("GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ----------------------
// POST
// ----------------------
export async function POST(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { params } = context;

    return NextResponse.json({
      success: true,
      method: "POST",
      params,
      body,
    });
  } catch (err: any) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
