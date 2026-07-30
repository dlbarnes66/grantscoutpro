export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { grant, report } = await req.json();

    if (!grant || !report) {
      return NextResponse.json({ error: "Missing grant or report" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Check reporting compliance. Return JSON:
{
  "issues": string[],
  "missingElements": string[],
  "alignmentScore": number,
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

Report:
${JSON.stringify(report)}
          `
        }
      ],
      max_tokens: 3500
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content || "{}"));
  } catch (err: any) {
    console.error("Post-award compliance error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
