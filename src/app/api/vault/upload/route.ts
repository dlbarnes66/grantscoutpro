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

    const { userId, content } = await req.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: "userId and content are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("vault")
      .insert({
        user_id: userId,
        content,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Vault upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload vault content" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Vault upload route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
