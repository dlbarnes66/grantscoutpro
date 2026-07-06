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
    const { action, userId } = await req.json();

    if (!action) {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin users list error:", error);
        return NextResponse.json(
          { error: "Failed to list users" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        users: data,
      });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required for this action" },
        { status: 400 }
      );
    }

    if (action === "ban" || action === "unban") {
      const banned = action === "ban";

      const { data, error } = await supabase
        .from("users")
        .update({ banned })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Admin user ban/unban error:", error);
        return NextResponse.json(
          { error: "Failed to update user banned status" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: data,
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Admin users route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
