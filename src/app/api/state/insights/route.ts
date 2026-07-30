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

    const { state } = await req.json();

    if (!state) {
      return NextResponse.json(
        { error: "state is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("state", state);

    if (error) {
      console.error("State insights error:", error);
      return NextResponse.json(
        { error: "Failed to load state insights" },
        { status: 500 }
      );
    }

    const insights = [
      `Grant activity in ${state} is trending upward.`,
      `Applicants in ${state} often succeed with strong community impact.`,
      `Deadlines in ${state} tend to be competitive—submit early.`
    ];

    return NextResponse.json({
      success: true,
      insights
    });
  } catch (err: any) {
    console.error("State insights route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
