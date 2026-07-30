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

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vault")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Vault structured error:", error);
      return NextResponse.json(
        { error: "Failed to load structured vault data" },
        { status: 500 }
      );
    }

    const structured = data.map((item) => ({
      id: item.id,
      created_at: item.created_at,
      preview: item.content?.slice(0, 50) || "",
      size: item.content?.length || 0
    }));

    return NextResponse.json({
      success: true,
      structured
    });
  } catch (err: any) {
    console.error("Vault structured route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
