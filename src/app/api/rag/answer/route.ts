import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json(
        { error: "question required" },
        { status: 400 }
      );
    }

    // Placeholder RAG logic
    const answer = `AI answer for: ${question}`;

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("RAG ANSWER ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
