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

    // Fetch formatted sections
    const { data: formattedSections } = await supabase
      .from("grant_formatted_sections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    // Fetch compliance packet
    const { data: compliancePacket } = await supabase
      .from("grant_compliance_packets")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    // Fetch required documents package
    const { data: requiredDocs } = await supabase
      .from("grant_required_documents")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    // Fetch full proposal
    const { data: proposal } = await supabase
      .from("grant_full_proposals")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    const prompt = `
You are an expert grant submission specialist. Assemble a final submission packet using:

Formatted Sections:
${JSON.stringify(formattedSections?.formatted_sections || [], null, 2)}

Compliance Packet:
${JSON.stringify(compliancePacket || {}, null, 2)}

Required Documents Package:
${JSON.stringify(requiredDocs || {}, null, 2)}

Full Proposal:
${JSON.stringify(proposal?.proposal || "", null, 2)}

Provide a JSON response:
{
  "packetStructure": string[],
  "packetSummary": string,
  "finalSubmissionNotes": string[],
  "recommendedUploadOrder": string[]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grant_submission_packets").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      packet_structure: result.packetStructure,
      packet_summary: result.packetSummary,
      final_submission_notes: result.finalSubmissionNotes,
      recommended_upload_order: result.recommendedUploadOrder,
    });

    return NextResponse.json({
      success: true,
      packetStructure: result.packetStructure,
      packetSummary: result.packetSummary,
      finalSubmissionNotes: result.finalSubmissionNotes,
      recommendedUploadOrder: result.recommendedUploadOrder,
    });
  } catch (err: any) {
    console.error("Final submission packet error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
