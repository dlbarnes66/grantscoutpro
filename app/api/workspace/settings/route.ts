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
    const { workspaceId, updates } = await req.json();

    if (!workspaceId || !updates) {
      return NextResponse.json(
        { error: "workspaceId and updates are required" },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      "name",
      "description",
      "color_theme",
      "ai_preferences",
      "notification_preferences",
    ];

    const filteredUpdates: Record<string, any> = {};

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workspaces")
      .update(filteredUpdates)
      .eq("id", workspaceId)
      .select()
      .single();

    if (error) {
      console.error("Workspace settings update error:", error);
      return NextResponse.json(
        { error: "Failed to update workspace settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workspace: data,
    });
  } catch (err: any) {
    console.error("Workspace settings route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
