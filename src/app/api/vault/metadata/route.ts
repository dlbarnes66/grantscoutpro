export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




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

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vault")
      .select("*")
      .eq("id", itemId)
      .single();

    if (error) {
      console.error("Vault metadata error:", error);
      return NextResponse.json(
        { error: "Failed to load vault metadata" },
        { status: 500 }
      );
    }

    const metadata = {
      id: data.id,
      created_at: data.created_at,
      size: data.content?.length || 0,
      preview: data.content?.slice(0, 100) || ""
    };

    return NextResponse.json({
      success: true,
      metadata
    });
  } catch (err: any) {
    console.error("Vault metadata route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
