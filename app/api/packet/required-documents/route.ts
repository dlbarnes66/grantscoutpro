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

    // Fetch compliance guidance (contains required documents list)
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

    // Fetch user-uploaded documents
    const { data: uploads } = await supabase
      .from("workspace_uploads")
      .select("*")
      .eq("workspace_id", workspaceId);

    // Fetch project documents (if any)
    const { data: projectDocs } = await supabase
      .from("workspace_project_documents")
      .select("*")
      .eq("workspace_id", workspaceId);

    const prompt = `
You are an expert grant submission specialist. Build a required documents package using:

Required Documents (from compliance):
${JSON.stringify(compliance.required_documents || [], null, 2)}

User Uploaded Documents:
${JSON.stringify(uploads || [], null, 2)}

Project Documents:
${JSON.stringify(projectDocs || [], null, 2)}

Provide a JSON response:
{
  "documentsIncluded": [
    {
      "name": string,
      "source": "upload" | "project" | "system",
      "fileId": string | null
    }
  ],
  "missingDocuments": string[],
  "recommendations": string[],
  "finalPackagingSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    await supabase.from("grant_required_documents").insert({
      workspace_id: workspaceId,
      grant_id: grantId,
      documents_included: result.documentsIncluded,
      missing_documents: result.missingDocuments,
      recommendations: result.recommendations,
      final_packaging_summary: result.finalPackagingSummary,
    });

    return NextResponse.json({
      success: true,
      documentsIncluded: result.documentsIncluded,
      missingDocuments: result.missingDocuments,
      recommendations: result.recommendations,
      finalPackagingSummary: result.finalPackagingSummary,
    });
  } catch (err: any) {
    console.error("Required documents packaging error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
