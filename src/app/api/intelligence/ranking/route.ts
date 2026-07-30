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

    const { grantIds } = await req.json();

    if (!grantIds || !Array.isArray(grantIds)) {
      return NextResponse.json(
        { error: "grantIds must be an array" },
        { status: 400 }
      );
    }

    // Fetch grants
    const { data: grants, error } = await supabase
      .from("grants")
      .select("*")
      .in("id", grantIds);

    if (error) {
      console.error("Ranking fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch grants" },
        { status: 500 }
      );
    }

    // Simple ranking logic (placeholder)
    const ranked = grants
      .map((g) => ({
        ...g,
        score: Math.random() * 100
      }))
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      ranking: ranked
    });
  } catch (err: any) {
    console.error("Ranking route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
