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
      console.error("Compliance fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch grant" },
        { status: 500 }
      );
    }

    // Simple placeholder compliance logic
    const complianceChecks = [];

    if (!grant.deadline) {
      complianceChecks.push("Missing deadline information");
    }

    if (!grant.category) {
      complianceChecks.push("Category not specified");
    }

    if (!grant.state) {
      complianceChecks.push("State eligibility unclear");
    }

    complianceChecks.push("Ensure all required documents are submitted");
    complianceChecks.push("Verify budget alignment with grant guidelines");

    return NextResponse.json({
      success: true,
      compliance: complianceChecks
    });
  } catch (err: any) {
    console.error("Compliance route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
