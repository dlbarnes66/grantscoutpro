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
    const { workspaceId, userId, fileId } = await req.json();

    if (!workspaceId || !userId || !fileId) {
      return NextResponse.json(
        { error: "workspaceId, userId, and fileId are required" },
        { status: 400 }
      );
    }

    // Fetch file metadata
    const { data: file, error: fileError } = await supabase
      .from("vault_files")
      .select("file_name")
      .eq("id", fileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (fileError || !file) {
      console.error("AI extraction file fetch error:", fileError);
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const title = "AI Extraction Complete";
    const message = `Your document "${file.file_name}" has finished AI extraction and is ready to view.`;

    // Create notification
    const { data: notification, error: notifyError } = await supabase
      .from("notifications")
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        title,
        message,
        type: "success",
        read: false,
      })
      .select()
      .single();

    if (notifyError) {
      console.error("AI extraction completion notification error:", notifyError);
      return NextResponse.json(
        { error: "Failed to send AI extraction completion notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
      fileId,
    });
  } catch (err: any) {
    console.error("AI extraction completion route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
