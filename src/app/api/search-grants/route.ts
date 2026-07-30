export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Groq from "groq-sdk";




export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY missing" },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: `Search grants related to: ${query}`
        }
      ]
    });

    const result = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      result
    });
  } catch (err: any) {
    console.error("Search grants route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
