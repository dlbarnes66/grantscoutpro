export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pdfParse from "pdf-parse-fork";
import { client } from "@/lib/openai";




export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    if (!data) {
      return NextResponse.json(
        { error: "PDF data is required" },
        { status: 400 }
      );
    }

    // Convert base64 → Buffer
    const buffer = Buffer.from(data, "base64");

    // Parse PDF text
    const pdf = await pdfParse(buffer);

    // Send text to OpenAI for compliance extraction
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Extract key compliance issues from this PDF text:\n\n${pdf.text}`,
        },
      ],
    });

    return NextResponse.json({
      text: pdf.text,
      analysis: response.choices[0].message,
    });
  } catch (err: any) {
    console.error("PDF detect error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
