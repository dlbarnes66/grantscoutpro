import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { workspaceId, grantId } = await req.json();

    if (!workspaceId || !grantId) {
      return NextResponse.json(
        { error: "workspaceId and grantId are required" },
        { status: 400 }
      );
    }

    // Fetch proposal sections
    const { data: sections } = await supabase
      .from("grant_sections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId);

    if (!sections || sections.length === 0) {
      return NextResponse.json(
        { error: "No sections found for formatting" },
        { status: 404 }
      );
    }

    // Fetch compliance rules
    const { data: compliance } = await supabase
      .from("grant_compliance")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const prompt = `
You are an expert grant formatting specialist. Format the following grant sections according to professional standards and compliance rules.

Sections:
${JSON.stringify(sections, null, 2)}

Compliance Formatting Rules:
${JSON.stringify(compliance?.formatting_rules || [], null, 2)}

Provide a JSON response:
{
  "formattedSections": [
    {
      "sectionName": string,
      "formattedContent": string
    }
  ],
  "globalFormattingNotes": string[],
  "complianceAdjustments": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grant_formatted_sections").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      formatted_sections: result.formattedSections,
      global_formatting_notes: result.globalFormattingNotes,
      compliance_adjustments: result.complianceAdjustments,
    });

    return NextResponse.json({
      success: true,
      formattedSections: result.formattedSections,
      globalFormattingNotes: result.globalFormattingNotes,
      complianceAdjustments: result.complianceAdjustments,
    });
  } catch (err: any) {
    console.error("Formatting engine error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
