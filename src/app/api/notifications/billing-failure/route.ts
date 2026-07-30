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

    const { userId, reason } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: "userId and reason are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("notifications")
      .insert({
        type: "billing_failure",
        user_id: userId,
        reason,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Billing failure notification error:", error);
      return NextResponse.json(
        { error: "Failed to send billing failure notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Billing failure route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
