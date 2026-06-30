import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    if (!grants || !profile) {
      return NextResponse.json({ error: "Missing grants or profile" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Balance risk. Return JSON:
{
  "riskLevel": "low" | "medium" | "high",
  "riskDistribution": string[],
  "highRiskGrants": string[],
  "riskMitigation": string[]
}
          `
        },
        {
          role: "user",
          content: `
Grants:
${JSON.stringify(grants)}

User Profile:
${JSON.stringify(profile)}
          `
        }
      ],
      max_tokens: 2500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Risk balancing error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
