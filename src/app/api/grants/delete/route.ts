export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
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

    const { grantId } = await request.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "grantId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("grants")
      .delete()
      .eq("id", grantId);

    if (error) {
      console.error("Grant delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete grant" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: true,
    });
  } catch (err: any) {
    console.error("Grant delete route error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
