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
    const { workspaceId, title, description, status } = await req.json();

    if (!workspaceId || !title) {
      return NextResponse.json(
        { error: "workspaceId and title are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("grants")
      .insert({
        workspace_id: workspaceId,
        title,
        description: description || "",
        status: status || "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase grant create error:", error);
      return NextResponse.json(
        { error: "Failed to create grant" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      grant: data,
    });
  } catch (err: any) {
    console.error("Grant create route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
