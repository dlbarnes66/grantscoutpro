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

    const { userId, label } = await req.json();

    if (!userId || !label) {
      return NextResponse.json(
        { error: "userId and label are required" },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = `key_${Math.random().toString(36).slice(2)}_${Date.now()}`;

    // Save API key in Supabase
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: userId,
        label,
        api_key: apiKey,
        revoked: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("API key create error:", error);
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      apiKey: data
    });
  } catch (err: any) {
    console.error("API key create route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
