export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { prompt, grantInfo, userProfile } = await req.json();

    if (!prompt || !grantInfo || !userProfile) {
      return NextResponse.json(
        { error: "Missing prompt, grantInfo, or userProfile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are GrantScout Pro's AI Auto‑Writer. Write polished, compelling grant application responses.",
        },
        {
          role: "user",
          content: `
Grant Information:
${grantInfo}

User Profile:
${JSON.stringify(userProfile)}

Prompt:
${prompt}
          `,
        },
      ],
      max_tokens: 800,
    });

    return NextResponse.json({
      output: response.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("AI application writer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
