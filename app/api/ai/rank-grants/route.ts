import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    if (!grants || !profile) {
      return NextResponse.json(
        { error: "Missing grants or profile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Rank grants based on user profile. Return JSON array sorted by best match.",
        },
        {
          role: "user",
          content: `
User Profile:
${JSON.stringify(profile)}

Grants:
${JSON.stringify(grants)}
          `,
        },
      ],
    });

    return NextResponse.json({
      ranked: JSON.parse(response.choices[0].message.content || "[]"),
    });
  } catch (err: any) {
    console.error("Grant ranking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
