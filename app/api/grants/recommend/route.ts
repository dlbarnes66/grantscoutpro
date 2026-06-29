import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: "Profile missing" }, { status: 404 });
    }

    const grants = await prisma.grant.findMany({
      where: { embedding: { not: null } },
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Recommend grants based on profile, metadata, and semantic relevance. Return JSON array.",
        },
        {
          role: "user",
          content: `
User Profile:
${JSON.stringify(user.profile)}

Grants:
${JSON.stringify(grants)}
          `,
        },
      ],
      max_tokens: 1200,
    });

    return NextResponse.json({
      recommendations: JSON.parse(response.choices[0].message.content || "[]"),
    });
  } catch (err: any) {
    console.error("Recommendation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
