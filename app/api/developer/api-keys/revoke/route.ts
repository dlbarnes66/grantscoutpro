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
    const { keyId, workspaceId } = await req.json();

    if (!keyId || !workspaceId) {
      return NextResponse.json(
        { error: "keyId and workspaceId are required" },
        { status: 400 }
      );
    }

    // Ensure key belongs to workspace
    const { data: key, error: keyError } = await supabase
      .from("api_keys")
      .select("id, active, workspace_id")
      .eq("id", keyId)
      .single();

    if (keyError || !key) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    if (key.workspace_id !== workspaceId) {
      return NextResponse.json(
        { error: "API key does not belong to this workspace" },
        { status: 403 }
      );
    }

    // Revoke key
    const { error: updateError } = await supabase
      .from("api_keys")
      .update({ active: false })
      .eq("id", keyId);

    if (updateError) {
      console.error("API key revoke error:", updateError);
      return NextResponse.json(
        { error: "Failed to revoke API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      keyId,
      revoked: true,
    });
  } catch (err: any) {
    console.error("API key revoke route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
