import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
            "Score the application across clarity, impact, feasibility, alignment, and budget. Return JSON.",
        },
        {
          role: "user",
          content: `
Grant:
${grantInfo}

Application:
${applicationText}
          `,
        },
      ],
      max_tokens: 1200,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Reviewer Pro error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
