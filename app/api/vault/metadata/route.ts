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

    const { data, error } = await supabase
      .from("vault_files")
      .select("*")
      .eq("id", fileId)
      .eq("workspace_id", workspaceId)
      .single();

    if (error || !data) {
      console.error("Vault metadata fetch error:", error);
      return NextResponse.json(
        { error: "File metadata not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      file: data,
    });
  } catch (err: any) {
    console.error("Vault metadata route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
