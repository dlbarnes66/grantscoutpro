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

    const { vaultId } = await req.json();

    if (!vaultId) {
      return NextResponse.json(
        { error: "vaultId is required" },
        { status: 400 }
      );
    }

    // Fetch vault data
    const { data, error } = await supabase
      .from("vault")
      .select("*")
      .eq("id", vaultId)
      .single();

    if (error) {
      console.error("Vault extract error:", error);
      return NextResponse.json(
        { error: "Failed to extract vault data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      vault: data
    });
  } catch (err: any) {
    console.error("Vault extract route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
