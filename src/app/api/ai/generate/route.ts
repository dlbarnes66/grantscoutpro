export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { client } from "@/lib/openai";




export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    // Stubbed auth: your session.user does not include an id field.
    // We allow generation without checking session.user.id.
    const userEmail = "stub-user@example.com";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate content for user ${userEmail} based on this prompt:\n\n${prompt}`,
        },
      ],
    });

    return NextResponse.json({
      result: response.choices[0].message,
    });
  } catch (err: any) {
    console.error("AI generate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
