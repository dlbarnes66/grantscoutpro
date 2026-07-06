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
    const { grantId, title, description, status } = await req.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "grantId is required" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {};
    if (title) updatePayload.title = title;
    if (description) updatePayload.description = description;
    if (status) updatePayload.status = status;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("grants")
      .update(updatePayload)
      .eq("id", grantId)
      .select()
      .single();

    if (error) {
      console.error("Supabase grant update error:", error);
      return NextResponse.json(
        { error: "Failed to update grant" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      grant: data,
    });
  } catch (err: any) {
    console.error("Grant update route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
