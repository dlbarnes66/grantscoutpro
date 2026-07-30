export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function POST(req: Request) {
  try {
    // Prevent Supabase from initializing during Next.js build
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      );
    }

    // Initialize Supabase ONLY after env vars are confirmed
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { workspaceId, rules } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!rules || !Array.isArray(rules)) {
      return NextResponse.json(
        { error: "rules must be an array" },
        { status: 400 }
      );
    }

    // Save alert rules for this workspace
    const { data, error } = await supabase
      .from("alert_rules")
      .upsert(
        rules.map((rule) => ({
          workspace_id: workspaceId,
          ...rule
        }))
      )
      .select();

    if (error) {
      console.error("Alert rules error:", error);
      return NextResponse.json(
        { error: "Failed to save alert rules" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rules: data
    });
  } catch (err: any) {
    console.error("Alert rules route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
