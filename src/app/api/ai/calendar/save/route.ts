"use server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      message: "Calendar save endpoint placeholder",
      body
    });
  } catch (err: any) {
    console.error("Calendar Save Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
