import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { grantA, grantB } = await req.json();

    if (!grantA || !grantB) {
      return NextResponse.json(
        { error: "grantA and grantB are required" },
        { status: 400 }
      );
    }

    const prompt = `
Compare the following two grants. Provide a clear, structured analysis of:
- Eligibility differences
- Funding differences
- Strengths and weaknesses
- Strategic recommendations

Grant A:
${grantA}

Grant B:
${grantB}
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
    console.error("Grant comparison error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
