export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grantInfo, userProfile } = await req.json();

    if (!grantInfo || !userProfile) {
      return NextResponse.json(
        { error: "Missing grantInfo or userProfile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a full grant application with sections, polished writing, and strong narrative.",
        },
        {
          role: "user",
          content: `
Grant Information:
${grantInfo}

User Profile:
${JSON.stringify(userProfile)}

Generate a complete application.
          `,
        },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json({
      application: response.choices[0].message.content,
    });
  } catch (err: any) {
    console.error("Full application writer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
