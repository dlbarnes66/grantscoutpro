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

    const { grantId } = await req.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "grantId is required" },
        { status: 400 }
      );
    }

    const { data: grant, error } = await supabase
      .from("grants")
      .select("*")
      .eq("id", grantId)
      .single();

    if (error) {
      console.error("Opportunity insights fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch grant" },
        { status: 500 }
      );
    }

    const insights = [
      "This grant aligns well with similar opportunities in your sector.",
      "Applicants with strong community impact tend to perform well.",
      "Deadlines are competitive; early submission increases success odds."
    ];

    return NextResponse.json({
      success: true,
      insights
    });
  } catch (err: any) {
    console.error("Opportunity insights route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
