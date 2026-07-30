export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";



export async function POST(req: Request) {
  try {
    const { documentId, userId, cursor } = await req.json();

    return NextResponse.json({
      broadcast: {
        type: "cursor",
        documentId,
        userId,
        cursor,
      },
    });
  } catch (err: any) {
    console.error("Cursor broadcast error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
