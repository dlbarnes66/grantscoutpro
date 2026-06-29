import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "No onboarding profile found" },
        { status: 404 }
      );
    }

    const prompt = `
You are an AI grant matching assistant.

User profile:
${JSON.stringify(profile, null, 2)}

Based on this, recommend 5–10 relevant grants.
For each grant, return:
- name
- funder
- amount range
- deadline
- why it matches
- key eligibility points

Respond in JSON array format.
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    // Correct way to extract text from Responses API
    const text = completion.output_text ?? "[]";

    let grants;
    try {
      grants = JSON.parse(text);
    } catch {
      grants = [];
    }

    return NextResponse.json({ grants });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
