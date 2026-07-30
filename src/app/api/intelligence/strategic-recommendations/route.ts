export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function POST(req: Request) {
  try {
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

    const { grantId, profile } = await req.json();

    if (!grantId || !profile) {
      return NextResponse.json(
        { error: "grantId and profile are required" },
        { status: 400 }
      );
    }

    const { data: grant, error } = await supabase
      .from("grants")
      .select("*")
      .eq("id", grantId)
      .single();

    if (error) {
      console.error("Strategic recommendations fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch grant" },
        { status: 500 }
      );
    }

    const recommendations = [];

    if (profile.category === grant.category) {
      recommendations.push("Highlight your alignment with the grant’s focus area.");
    }

    if (profile.state === grant.state) {
      recommendations.push("Emphasize your regional impact to strengthen your application.");
    }

    if (!grant.deadline) {
      recommendations.push("Contact the grantor to confirm deadline details.");
    }

    recommendations.push("Submit early to maximize review consideration.");

    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (err: any) {
    console.error("Strategic recommendations route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
