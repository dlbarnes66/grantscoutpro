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
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspaceId") as string;
    const userId = formData.get("userId") as string;

    if (!file || !workspaceId || !userId) {
      return NextResponse.json(
        { error: "file, workspaceId, and userId are required" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = `${workspaceId}/${Date.now()}-${file.name}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("vault")
      .upload(filePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
      });

    if (storageError) {
      console.error("Vault upload error:", storageError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const { data: metadata, error: metadataError } = await supabase
      .from("vault_files")
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (metadataError) {
      console.error("Vault metadata insert error:", metadataError);
      return NextResponse.json(
        { error: "Failed to save file metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: metadata,
    });
  } catch (err: any) {
    console.error("Vault upload route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
