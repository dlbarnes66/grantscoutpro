import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing title or content" },
        { status: 400 }
      );
    }

    const pdfText = `
      ${title}
      -------------------------
      ${content}
    `;

    const base64 = Buffer.from(pdfText).toString("base64");

    return NextResponse.json({ base64 });
  } catch (err: any) {
    console.error("PDF report error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
