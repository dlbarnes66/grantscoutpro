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

    const { workspaceId, sectionName, revisionText } = await req.json();

    if (!workspaceId || !sectionName) {
      return NextResponse.json(
        { error: "workspaceId and sectionName are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("writer_revisions")
      .insert({
        workspace_id: workspaceId,
        section_name: sectionName,
        revision_text: revisionText
      });

    if (error) {
      console.error("Writer revision error:", error);
      return NextResponse.json(
        { error: "Failed to save writer revision" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Writer revision route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
