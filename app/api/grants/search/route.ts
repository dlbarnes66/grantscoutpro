import { NextResponse } from "next/server";
import { client } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert grant researcher. Based on the following search query,
identify the types of grants that would likely match and provide:

1. Grant categories
2. Typical eligibility criteria
3. Common funding ranges
4. Strategic recommendations for the applicant

Search Query:
${query}
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
    console.error("Grant search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
