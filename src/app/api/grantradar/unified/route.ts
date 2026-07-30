export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function POST(req: Request) {
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

    const body = await req.json();

    const { userId, query, filters } = body;

    if (!userId || !query) {
      return NextResponse.json(
        { error: "userId and query are required" },
        { status: 400 }
      );
    }

    // Fetch user workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (workspaceError) {
      console.error("Unified workspace error:", workspaceError);
      return NextResponse.json(
        { error: "Failed to load workspace" },
        { status: 500 }
      );
    }

    // Fetch grants matching query
    const { data: grants, error: grantsError } = await supabase
      .from("grants")
      .select("*")
      .ilike("title", `%${query}%`);

    if (grantsError) {
      console.error("Unified grants error:", grantsError);
      return NextResponse.json(
        { error: "Failed to load grants" },
        { status: 500 }
      );
    }

    // Apply filters if provided
    let filtered = grants;

    if (filters?.category) {
      filtered = filtered.filter((g) => g.category === filters.category);
    }

    if (filters?.state) {
      filtered = filtered.filter((g) => g.state === filters.state);
    }

    if (filters?.deadlineBefore) {
      filtered = filtered.filter(
        (g) => new Date(g.deadline) < new Date(filters.deadlineBefore)
      );
    }

    return NextResponse.json({
      success: true,
      workspace,
      results: filtered
    });
  } catch (err: any) {
    console.error("Unified route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
