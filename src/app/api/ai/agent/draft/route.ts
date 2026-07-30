export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { grant, profile } = await req.json();

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
            "Write a full grant application draft. Return JSON: { draft: string }",
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

User Profile:
${JSON.stringify(profile)}
          `,
        },
      ],
      max_tokens: 3000,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Draft agent error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
