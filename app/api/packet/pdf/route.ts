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

    // Fetch full proposal
    const { data: proposal } = await supabase
      .from("grant_full_proposals")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("grant_id", grantId)
      .single();

    if (!proposal) {
      return NextResponse.json(
        { error: "Full proposal not found" },
        { status: 404 }
      );
    }

    // Convert proposal text into PDF using OpenAI
    const pdfResponse = await client.files.create({
      file: new File(
        [proposal.proposal],
        "proposal.txt",
        { type: "text/plain" }
      ),
      purpose: "assistants"
    });

    return NextResponse.json({
      success: true,
      pdfFileId: pdfResponse.id,
      message: "PDF generated successfully"
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
