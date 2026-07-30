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
      console.error("Score fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch grant" },
        { status: 500 }
      );
    }

    const score =
      (profile.state === grant.state ? 30 : 0) +
      (profile.category === grant.category ? 30 : 0) +
      (grant.deadline ? 20 : 0) +
      Math.floor(Math.random() * 20);

    return NextResponse.json({
      success: true,
      score
    });
  } catch (err: any) {
    console.error("Score route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
