import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateApiKey() {
  return "gsp_" + crypto.randomBytes(32).toString("hex");
}

export async function POST(req: Request) {
  try {
    const { workspaceId, userId, label } = await req.json();

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: "workspaceId and userId are required" },
        { status: 400 }
      );
    }

    const apiKey = generateApiKey();

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        label: label || "Untitled Key",
        api_key: apiKey,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("API key creation error:", error);
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      apiKey: data.api_key,
      keyId: data.id,
      label: data.label,
    });
  } catch (err: any) {
    console.error("API key create route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
