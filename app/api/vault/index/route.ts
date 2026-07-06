import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { fileId, workspaceId } = await req.json();

    if (!fileId || !workspaceId) {
      return NextResponse.json(
        { error: "fileId and workspaceId are required" },
        { status: 400 }
      );
    }

    // Fetch metadata
    const { data: metadata, error: metadataError } = await supabase
      .from("vault_files")
      .select("file_name, file_type, file_size, created_at")
      .eq("id", fileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (metadataError || !metadata) {
      console.error("Vault index metadata error:", metadataError);
      return NextResponse.json(
        { error: "File metadata not found" },
        { status: 404 }
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
      console.error("Vault index extraction error:", extractionError);
      return NextResponse.json(
        { error: "Extracted text not found. Run /vault/extract first." },
        { status: 404 }
      );
    }

    // Fetch structured data
    const { data: structured, error: structuredError } = await supabase
      .from("vault_structured")
      .select("structured_data")
      .eq("file_id", fileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (structuredError || !structured) {
      console.error("Vault index structured error:", structuredError);
      return NextResponse.json(
        { error: "Structured extraction not found. Run /vault/structured first." },
        { status: 404 }
      );
    }

    // Build index record
    const indexRecord = {
      file_id: fileId,
      workspace_id: workspaceId,
      file_name: metadata.file_name,
      file_type: metadata.file_type,
      file_size: metadata.file_size,
      created_at: metadata.created_at,
      extracted_text: extraction.extracted_text,
      structured_data: structured.structured_data,
    };

    // Save index
    const { data: saved, error: saveError } = await supabase
      .from("vault_index")
      .insert(indexRecord)
      .select()
      .single();

    if (saveError) {
      console.error("Vault index save error:", saveError);
      return NextResponse.json(
        { error: "Failed to save vault index" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      index: saved,
    });
  } catch (err: any) {
    console.error("Vault index route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
