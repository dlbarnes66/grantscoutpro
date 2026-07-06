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
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Fetch user limits
    const { data: limits, error } = await supabase
      .from("user_limits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Supabase user limits error:", error);
      return NextResponse.json(
        { error: "Failed to fetch user limits" },
        { status: 500 }
      );
    }

    // If no limits exist, create default limits
    if (!limits) {
      const { data: newLimits, error: createError } = await supabase
        .from("user_limits")
        .insert({
          user_id: userId,
          max_workspaces: 1,
          max_members_per_workspace: 3,
          max_grants: 25,
        })
        .select()
        .single();

      if (createError) {
        console.error("Supabase create default limits error:", createError);
        return NextResponse.json(
          { error: "Failed to initialize user limits" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        limits: newLimits,
        initialized: true,
      });
    }

    return NextResponse.json({
      success: true,
      limits,
      initialized: false,
    });
  } catch (err: any) {
    console.error("User limits route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
