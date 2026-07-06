import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, result } = await req.json();

    if (!userId || !result) {
      return NextResponse.json(
        { error: "userId and result are required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no autoEditorHistory model.
    // No database writes are performed.
    const entry = {
      id: "stub-autoeditor-history",
      userId,
      result,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("AutoEditor history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
