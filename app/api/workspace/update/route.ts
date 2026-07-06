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
    const { workspaceId, name, plan, status } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {};

    if (name) updatePayload.name = name;
    if (plan) updatePayload.plan = plan;
    if (status) updatePayload.status = status;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workspaces")
      .update(updatePayload)
      .eq("id", workspaceId)
      .select()
      .single();

    if (error) {
      console.error("Supabase workspace update error:", error);
      return NextResponse.json(
        { error: "Failed to update workspace" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workspace: data,
    });
  } catch (err: any) {
    console.error("Workspace update route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
