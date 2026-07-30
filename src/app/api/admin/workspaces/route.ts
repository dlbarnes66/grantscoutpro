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

    const { action } = await req.json();

    if (!action) {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin workspaces list error:", error);
        return NextResponse.json(
          { error: "Failed to list workspaces" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        workspaces: data,
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Admin workspaces route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
