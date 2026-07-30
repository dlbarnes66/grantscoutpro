export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function GET(req: Request) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workspace")
      .select("trialActive, trialStart, trialEnd, trialLocked, trialDaysRemaining")
      .eq("id", workspaceId)
      .single();

    if (error) {
      console.error("Trial status error:", error);
      return NextResponse.json(
        { error: "Failed to load trial status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trialStatus: data
    });
  } catch (err: any) {
    console.error("Trial status route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
