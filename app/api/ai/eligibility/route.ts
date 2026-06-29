import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grantText, profile } = await req.json();

    if (!grantText || !profile) {
      return NextResponse.json(
        { error: "Missing grantText or profile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Determine eligibility for grants based on user profile. Provide a clear yes/no and reasoning.",
        },
        {
          role: "user",
          content: `Grant: ${grantText}\n\nUser Profile: ${JSON.stringify(
            profile
          )}`,
        },
      ],
    });

    return NextResponse.json({ eligibility: response.choices[0].message.content });
  } catch (err: any) {
    console.error("Eligibility error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
