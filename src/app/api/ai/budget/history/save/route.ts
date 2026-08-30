"use server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      message: "History save endpoint placeholder",
      body
    });
  } catch (err: any) {
    console.error("History Save Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
