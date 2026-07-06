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
    const {
      workspaceId,
      apiKey,
      endpoint,
      success,
      responseTimeMs,
      payloadBytes,
    } = await req.json();

    if (!workspaceId || !apiKey || !endpoint) {
      return NextResponse.json(
        { error: "workspaceId, apiKey, and endpoint are required" },
        { status: 400 }
      );
    }

    // Validate API key
    const { data: keyRecord, error: keyError } = await supabase
      .from("api_keys")
      .select("id, active, workspace_id")
      .eq("api_key", apiKey)
      .single();

    if (keyError || !keyRecord) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 403 }
      );
    }

    if (!keyRecord.active) {
      return NextResponse.json(
        { error: "API key is revoked" },
        { status: 403 }
      );
    }

    if (keyRecord.workspace_id !== workspaceId) {
      return NextResponse.json(
        { error: "API key does not belong to this workspace" },
        { status: 403 }
      );
    }

    // Log usage
    const { error: logError } = await supabase.from("api_usage_logs").insert({
      workspace_id: workspaceId,
      api_key_id: keyRecord.id,
      endpoint,
      success: success ?? true,
      response_time_ms: responseTimeMs ?? null,
      payload_bytes: payloadBytes ?? null,
    });

    if (logError) {
      console.error("API usage log error:", logError);
      return NextResponse.json(
        { error: "Failed to log API usage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logged: true,
    });
  } catch (err: any) {
    console.error("API usage log route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
