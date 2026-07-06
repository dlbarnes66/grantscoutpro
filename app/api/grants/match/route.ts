import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { profile, grantText } = await req.json();

    if (!profile || !grantText) {
      return NextResponse.json(
        { error: "profile and grantText are required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert grant evaluator. Determine how well this applicant profile
matches the grant opportunity. Provide:

1. Match score (0–100)
2. Key strengths
3. Potential disqualifiers
4. Strategic recommendations

Applicant Profile:
${profile}

Grant Opportunity:
${grantText}
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({
      result: response.choices[0].message,
    });
  } catch (err: any) {
    console.error("Grant match error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
