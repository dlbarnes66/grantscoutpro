export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRedis } from "@/lib/redis";




export async function GET(req: Request) {
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Use actual Redis client (not BullMQ RedisOptions)
    const redis = getRedis();

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Try Redis cache first
    if (redis) {
      const cached = await redis.get(`workspace:${workspaceId}:summary`);
      if (cached) {
        return NextResponse.json({
          success: true,
          summary: JSON.parse(cached)
        });
      }
    }

    // Fetch summary from Supabase
    const { data, error } = await supabase
      .from("workspace_data")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (error) {
      console.error("Dashboard summary error:", error);
      return NextResponse.json(
        { error: "Failed to load dashboard summary" },
        { status: 500 }
      );
    }

    // Cache result
    if (redis) {
      await redis.set(
        `workspace:${workspaceId}:summary`,
        JSON.stringify(data),
        "EX",
        60
      );
    }

    return NextResponse.json({
      success: true,
      summary: data
    });
  } catch (err: any) {
    console.error("Dashboard summary route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
