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

    // Fetch file metadata
    const { data: file, error: fetchError } = await supabase
      .from("vault_files")
      .select("file_path")
      .eq("id", fileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (fetchError || !file) {
      console.error("Vault delete fetch error:", fetchError);
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("vault")
      .remove([file.file_path]);

    if (storageError) {
      console.error("Vault storage delete error:", storageError);
      return NextResponse.json(
        { error: "Failed to delete file from storage" },
        { status: 500 }
      );
    }

    // Delete metadata
    const { error: metadataError } = await supabase
      .from("vault_files")
      .delete()
      .eq("id", fileId);

    if (metadataError) {
      console.error("Vault metadata delete error:", metadataError);
      return NextResponse.json(
        { error: "Failed to delete file metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: fileId,
    });
  } catch (err: any) {
    console.error("Vault delete route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
