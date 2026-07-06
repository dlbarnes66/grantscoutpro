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
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("workspace_members")
      .select("id, user_id, role")
      .eq("workspace_id", workspaceId);

    if (error) {
      console.error("Supabase workspace members error:", error);
      return NextResponse.json(
        { error: "Failed to fetch workspace members" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      members: data,
    });
  } catch (err: any) {
    console.error("Workspace members route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
