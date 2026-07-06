import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { fileId, workspaceId } = await req.json();

    if (!fileId || !workspaceId) {
      return NextResponse.json(
        { error: "fileId and workspaceId are required" },
        { status: 400 }
      );
    }

    // Fetch extracted text
    const { data: extraction, error: extractionError } = await supabase
      .from("vault_extractions")
      .select("extracted_text")
      .eq("file_id", fileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (extractionError || !extraction) {
      console.error("Structured extraction fetch error:", extractionError);
      return NextResponse.json(
        { error: "Extracted text not found. Run /vault/extract first." },
        { status: 404 }
      );
    }

    const rawText = extraction.extracted_text;

    // AI STRUCTURED EXTRACTION
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You extract structured grant-related fields from raw PDF text. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: `
Extract the following fields from this document:

- grant_title
- agency
- deadline
- funding_amount
- eligibility_summary
- full_summary

Raw text:
${rawText}
          `,
        },
      ],
      temperature: 0.2,
    });

    let structured;
    try {
      structured = JSON.parse(aiResponse.choices[0].message.content || "{}");
    } catch (err) {
      console.error("AI JSON parse error:", err);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    // Save structured extraction
    const { data: record, error: saveError } = await supabase
      .from("vault_structured")
      .insert({
        file_id: fileId,
        workspace_id: workspaceId,
        structured_data: structured,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Structured extraction save error:", saveError);
      return NextResponse.json(
        { error: "Failed to save structured extraction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      structured,
      record,
    });
  } catch (err: any) {
    console.error("Vault structured extraction route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
