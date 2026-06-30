import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { grant, application } = await req.json();

    if (!grant || !application) {
      return NextResponse.json(
        { error: "Missing grant or application" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Simulate a grant review panel of 5 reviewers.
Return JSON:
{
  "reviewers": [
    {
      "name": string,
      "background": string,
      "score": number,
      "comments": string,
      "concerns": string[]
    }
  ],
  "panelSummary": string,
  "averageScore": number,
  "fundingRecommendation": string
}
          `,
        },
        {
          role: "user",
          content: `
Grant:
${JSON.stringify(grant)}

Application:
${JSON.stringify(application)}
          `,
        },
      ],
      max_tokens: 3500,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Reviewer panel error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
