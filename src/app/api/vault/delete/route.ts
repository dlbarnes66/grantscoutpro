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

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("vault")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Vault delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete vault item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Vault delete route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
