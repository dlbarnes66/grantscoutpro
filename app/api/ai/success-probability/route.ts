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
    const { grant, profile, history } = await req.json();

    if (!grant || !profile) {
      return NextResponse.json(
        { error: "Missing grant or profile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Predict the user's probability of winning this grant. Return JSON: { probability: number (0-100), confidence: number (0-100), reasoning: string, recommendations: string[] }",
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

User Profile:
${JSON.stringify(profile)}

Past Application History:
${JSON.stringify(history ?? [])}
          `,
        },
      ],
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Success probability error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
