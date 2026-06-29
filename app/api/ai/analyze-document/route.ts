import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const text = Buffer.from(file.content, "base64").toString("utf8");

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Analyze the document and provide insights, risks, and opportunities.",
        },
        { role: "user", content: text },
      ],
      max_tokens: 800,
    });

    return NextResponse.json({
      analysis: response.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("Document analysis error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
