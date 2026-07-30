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

    const { grantId } = await req.json();

    if (!grantId) {
      return NextResponse.json(
        { error: "grantId is required" },
        { status: 400 }
      );
    }

    const { data: grant, error } = await supabase
      .from("grants")
      .select("*")
      .eq("id", grantId)
      .single();

    if (error) {
      console.error("Packet PDF fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch grant" },
        { status: 500 }
      );
    }

    const pdfContent = `
Grant Packet
============
Title: ${grant.title}
Category: ${grant.category}
State: ${grant.state}
Deadline: ${grant.deadline}
`;

    return NextResponse.json({
      success: true,
      pdfContent
    });
  } catch (err: any) {
    console.error("Packet PDF route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
