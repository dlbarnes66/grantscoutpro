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

    const { grantId } = await req.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "grantId is required" },
        { status: 400 }
      );
    }

    // Fetch grant details
    const { data: grant, error } = await supabase
      .from("grants")
      .select("*")
      .eq("id", grantId)
      .single();

    if (error) {
      console.error("Risk flags fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch grant" },
        { status: 500 }
      );
    }

    // Simple placeholder risk logic
    const riskFlags = [];

    if (!grant.deadline) {
      riskFlags.push("Missing deadline information");
    }

    if (!grant.category) {
      riskFlags.push("Category not specified");
    }

    if (!grant.state) {
      riskFlags.push("State eligibility unclear");
    }

    if (Math.random() > 0.7) {
      riskFlags.push("Highly competitive grant");
    }

    return NextResponse.json({
      success: true,
      riskFlags
    });
  } catch (err: any) {
    console.error("Risk flags route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
