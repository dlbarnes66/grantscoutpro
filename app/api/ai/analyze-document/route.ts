import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { fileId, prompt } = await req.json();

    if (!fileId || !prompt) {
      return NextResponse.json(
        { error: "fileId and prompt are required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no File model.
    // This endpoint is kept for UI compatibility but does not perform DB lookups.
    const fakeAnalysis = {
      fileId,
      summary: "Document analysis stubbed — no file model exists in the database.",
      insights: [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(fakeAnalysis);
  } catch (err: any) {
    console.error("Analyze document error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
