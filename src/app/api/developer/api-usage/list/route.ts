export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function GET() {
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

    // Fetch all API usage logs
    const { data, error } = await supabase
      .from("api_usage")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("API usage list error:", error);
      return NextResponse.json(
        { error: "Failed to load API usage logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: data
    });
  } catch (err: any) {
    console.error("API usage list route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
