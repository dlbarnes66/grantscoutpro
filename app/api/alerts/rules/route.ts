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
    const { workspaceId, rules } = await req.json();

    if (!workspaceId || !rules) {
      return NextResponse.json(
        { error: "workspaceId and rules are required" },
        { status: 400 }
      );
    }

    await supabase.from("alert_rules").upsert({
      workspace_id: workspaceId,
      rules,
    });

    return NextResponse.json({
      success: true,
      message: "Alert rules saved",
      rules,
    });
  } catch (err: any) {
    console.error("Alert rules error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
