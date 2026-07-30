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

    const { apiKeyId, endpoint, success } = await req.json();

    if (!apiKeyId || !endpoint) {
      return NextResponse.json(
        { error: "apiKeyId and endpoint are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("api_usage")
      .insert({
        api_key_id: apiKeyId,
        endpoint,
        success: success ?? true,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("API usage log error:", error);
      return NextResponse.json(
        { error: "Failed to log API usage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      log: data
    });
  } catch (err: any) {
    console.error("API usage log route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
