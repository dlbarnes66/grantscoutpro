export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";




const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { grants, profile, probabilities, timeAvailable, fundingGoal } =
      await req.json();

    if (!grants || !Array.isArray(grants) || !profile) {
      return NextResponse.json(
        { error: "Missing grants array or profile" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an expert grant strategist. Optimize the user's grant portfolio.

Return JSON:
{
  "recommendedOrder": [{ "grantId": string, "reason": string }],
  "expectedROI": number,
  "riskLevel": "low" | "medium" | "high",
  "timeAnalysis": {
    "totalTimeRequired": number,
    "timeAvailable": number,
    "fit": "good" | "tight" | "insufficient"
  },
  "probabilityWeightedOutcome": number,
  "recommendations": string[]
}
          `,
        },
        {
          role: "user",
          content: `
User Profile:
${JSON.stringify(profile)}

Grants:
${JSON.stringify(grants)}

Success Probabilities:
${JSON.stringify(probabilities ?? [])}

Time Available:
${timeAvailable ?? "unknown"}

Funding Goal:
${fundingGoal ?? "none"}
          `,
        },
      ],
      max_tokens: 2000,
    });

    return NextResponse.json(
      JSON.parse(response.choices[0].message.content || "{}")
    );
  } catch (err: any) {
    console.error("Portfolio optimizer error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
