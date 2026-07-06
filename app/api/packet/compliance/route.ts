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

    // Fetch compliance guidance
    const { data: compliance } = await supabase
      .from("grant_compliance")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    if (!compliance) {
      return NextResponse.json(
        { error: "Compliance guidance not found" },
        { status: 404 }
      );
    }

    // Fetch formatted sections
    const { data: formattedSections } = await supabase
      .from("grant_formatted_sections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    // Fetch proposal PDF file ID
    const { data: pdf } = await supabase
      .from("grant_full_proposals")
      .select("proposal")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const prompt = `
You are an expert grant compliance packet builder. Assemble a compliance packet using the following components:

Compliance Guidance:
${JSON.stringify(compliance, null, 2)}

Formatted Sections:
${JSON.stringify(formattedSections?.formatted_sections || [], null, 2)}

Proposal PDF (text content):
${JSON.stringify(pdf?.proposal || "", null, 2)}

Provide a JSON response:
{
  "packetChecklist": string[],
  "includedDocuments": string[],
  "complianceSummary": string,
  "finalPacketNotes": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grant_compliance_packets").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      packet_checklist: result.packetChecklist,
      included_documents: result.includedDocuments,
      compliance_summary: result.complianceSummary,
      final_packet_notes: result.finalPacketNotes,
    });

    return NextResponse.json({
      success: true,
      packetChecklist: result.packetChecklist,
      includedDocuments: result.includedDocuments,
      complianceSummary: result.complianceSummary,
      finalPacketNotes: result.finalPacketNotes,
    });
  } catch (err: any) {
    console.error("Compliance packet builder error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
