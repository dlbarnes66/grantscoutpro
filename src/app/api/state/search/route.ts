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

    const { state, query } = await req.json();

    if (!state || !query) {
      return NextResponse.json(
        { error: "state and query are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("state", state)
      .ilike("title", `%${query}%`);

    if (error) {
      console.error("State search error:", error);
      return NextResponse.json(
        { error: "Failed to search state grants" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results: data
    });
  } catch (err: any) {
    console.error("State search route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
