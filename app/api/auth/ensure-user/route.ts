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
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "userId and email are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Supabase ensure-user fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to check user" },
        { status: 500 }
      );
    }

    // If exists, return it
    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        created: false,
      });
    }

    // Otherwise create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Supabase ensure-user create error:", createError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      created: true,
    });
  } catch (err: any) {
    console.error("Ensure-user route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
