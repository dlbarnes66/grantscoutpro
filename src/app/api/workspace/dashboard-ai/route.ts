export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRedis } from "@/lib/redis";




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

    const redis = getRedis();

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const cached = await redis.get(`workspace:${workspaceId}:dashboard`);
    if (cached) {
      return NextResponse.json({
        success: true,
        dashboard: JSON.parse(cached)
      });
    }

    const { data, error } = await supabase
      .from("workspace_data")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (error) {
      console.error("Dashboard AI error:", error);
      return NextResponse.json(
        { error: "Failed to load dashboard data" },
        { status: 500 }
      );
    }

    await redis.set(
      `workspace:${workspaceId}:dashboard`,
      JSON.stringify(data),
      "EX",
      60
    );

    return NextResponse.json({
      success: true,
      dashboard: data
    });
  } catch (err: any) {
    console.error("Dashboard AI route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
