import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, attachments } = await req.json();

    if (!grant || !attachments) {
      return NextResponse.json({ error: "Missing grant or attachments" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Validate attachments. Return JSON:
{
  "missingAttachments": string[],
  "invalidAttachments": string[],
  "formatIssues": string[],
  "fixes": string[],
  "summary": string
}
          `
        },
        {
          role: "user",
          content: `
Grant Requirements:
${JSON.stringify(grant)}

Attachments:
${JSON.stringify(attachments)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Attachment validation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
