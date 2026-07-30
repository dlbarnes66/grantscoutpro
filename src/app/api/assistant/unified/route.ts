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

    // Initialize Supabase ONLY after env vars are confirmed
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { workspaceId, query } = await req.json();

    if (!workspaceId || !query) {
      return NextResponse.json(
        { error: "workspaceId and query are required" },
        { status: 400 }
      );
    }

    // Fetch workspace context
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (workspaceError) {
      console.error("Unified assistant workspace error:", workspaceError);
      return NextResponse.json(
        { error: "Failed to load workspace" },
        { status: 500 }
      );
    }

    // Unified assistant response placeholder
    return NextResponse.json({
      success: true,
      response: `Unified assistant response for workspace ${workspaceId}: ${query}`
    });
  } catch (err: any) {
    console.error("Assistant unified route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
