export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";




export async function GET(req: Request) {
  try {
    const supabase = createClient();

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ keys: data });
  } catch (err: any) {
    console.error("API key list error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
