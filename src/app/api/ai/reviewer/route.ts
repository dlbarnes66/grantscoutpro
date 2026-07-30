export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { applicationText, grantInfo } = await req.json();

    if (!applicationText || !grantInfo) {
      return NextResponse.json(
        { error: "Missing applicationText or grantInfo" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert grant reviewer. Score the application from 0–100 and provide detailed feedback.",
        },
        {
          role: "user",
          content: `
Grant Information:
${grantInfo}

Application:
${applicationText}
          `,
        },
      ],
      max_tokens: 800,
    });

    return NextResponse.json({
      review: response.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("AI reviewer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
