export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";



export async function POST(req: Request) {
  try {
    const { documentId, userId, delta } = await req.json();

    return NextResponse.json({
      broadcast: {
        type: "edit",
        documentId,
        userId,
        delta,
      },
    });
  } catch (err: any) {
    console.error("Edit broadcast error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
