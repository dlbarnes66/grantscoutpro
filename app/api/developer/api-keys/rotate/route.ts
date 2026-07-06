import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { workspaceId, keyId } = await req.json();

    if (!workspaceId || !keyId) {
      return NextResponse.json(
        { error: "Missing workspaceId or keyId" },
        { status: 400 }
      );
    }

    const newKey = crypto.randomBytes(32).toString("hex");

    const { error: deactivateError } = await supabase
      .from("api_keys")
      .update({ active: false })
      .eq("id", keyId);

    if (deactivateError) throw deactivateError;

    const { error: insertError } = await supabase
      .from("api_keys")
      .insert({
        workspace_id: workspaceId,
        label: "Rotated Key",
        api_key: newKey,
        active: true,
      });

    if (insertError) throw insertError;

    return NextResponse.json({ apiKey: newKey });
  } catch (err: any) {
    console.error("API key rotation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
