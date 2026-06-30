import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { funder, profile, grant } = await req.json();

    if (!funder || !profile || !grant) {
      return NextResponse.json({ error: "Missing funder, profile, or grant" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Write a cold outreach email to a funder. Return JSON:
{
  "subject": string,
  "body": string,
  "tone": string
}
          `
        },
        {
          role: "user",
          content: `
Funder:
${JSON.stringify(funder)}

User Profile:
${JSON.stringify(profile)}

Grant:
${JSON.stringify(grant)}
          `
        }
      ],
      max_tokens: 2000
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Outreach email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
