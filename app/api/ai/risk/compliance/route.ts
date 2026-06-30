import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, application } = await req.json();

    if (!grant || !application) {
      return NextResponse.json({ error: "Missing grant or application" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Detect compliance risks. Return JSON:
{
  "issues": string[],
  "severity": "low" | "medium" | "high",
  "missingRequirements": string[],
  "regulatoryRisks": string[],
  "fixes": string[]
}
          `
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

Application:
${JSON.stringify(application)}
          `
        }
      ],
      max_tokens: 2500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Compliance risk error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
