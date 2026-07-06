import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { grantId } = await req.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "grantId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("grants")
      .delete()
      .eq("id", grantId);

    if (error) {
      console.error("Supabase grant delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete grant" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: grantId,
    });
  } catch (err: any) {
    console.error("Grant delete route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
