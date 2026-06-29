import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { versionA, versionB } = await req.json();

    if (!versionA || !versionB) {
      return NextResponse.json(
        { error: "Missing versionA or versionB" },
        { status: 400 }
      );
    }

    const vA = await prisma.documentVersion.findUnique({
      where: { id: versionA },
    });

    const vB = await prisma.documentVersion.findUnique({
      where: { id: versionB },
    });

    if (!vA || !vB) {
      return NextResponse.json({ error: "Versions not found" }, { status: 404 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Compare two document versions and produce a clear diff. Return JSON: { added: string[], removed: string[], modified: string[] }",
        },
        {
          role: "user",
          content: `
Version A:
${vA.content}

Version B:
${vB.content}
          `,
        },
      ],
      max_tokens: 1500,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Version diff error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
