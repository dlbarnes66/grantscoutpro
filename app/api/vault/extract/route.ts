import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import pdf from "pdf-parse-fork";

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

    // Fetch file from Supabase storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("vault")
      .download(fileId);

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Extract text using pdf-parse-fork
    const parsed = await pdf(buffer);

    await supabase.from("vault_extracted").insert({
      workspace_id: workspaceId,
      file_id: fileId,
      extracted_text: parsed.text,
    });

    return NextResponse.json({
      success: true,
      extracted: parsed.text,
    });
  } catch (err: any) {
    console.error("Vault extract error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
