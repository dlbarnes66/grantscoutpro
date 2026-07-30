export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Prevent Supabase from initializing during Next.js build
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

    const body = await request.json();
    const { title, description, category, state, deadline } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "title and description are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("grants")
      .insert({
        title,
        description,
        category: category || null,
        state: state || null,
        deadline: deadline || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Grant create error:", error);
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
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
