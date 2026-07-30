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

    const { userId, grantId } = await req.json();

    if (!userId || !grantId) {
      return NextResponse.json(
        { error: "userId and grantId are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("notifications")
      .insert({
        type: "ai_extraction_complete",
        user_id: userId,
        grant_id: grantId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("AI extraction complete error:", error);
      return NextResponse.json(
        { error: "Failed to send extraction notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("AI extraction complete route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
