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
      console.error("State structure error:", error);
      return NextResponse.json(
        { error: "Failed to load state structure" },
        { status: 500 }
      );
    }

    const structure = {
      state,
      totalGrants: data.length,
      categories: [...new Set(data.map((g) => g.category))],
      hasDeadlines: data.some((g) => g.deadline),
      insights: [
        `Grant activity in ${state} shows diverse categories.`,
        `Applicants in ${state} benefit from strong documentation.`,
        `Deadlines vary widely; early preparation is recommended.`
      ]
    };

    return NextResponse.json({
      success: true,
      structure
    });
  } catch (err: any) {
    console.error("State structure route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
