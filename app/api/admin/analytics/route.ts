import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const [{ data: users }, { data: workspaces }, { data: grants }] =
      await Promise.all([
        supabase.from("users").select("id"),
        supabase.from("workspaces").select("id"),
        supabase.from("grants").select("id"),
      ]);

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers: users?.length || 0,
        totalWorkspaces: workspaces?.length || 0,
        totalGrants: grants?.length || 0,
      },
    });
  } catch (err: any) {
    console.error("Admin analytics route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
