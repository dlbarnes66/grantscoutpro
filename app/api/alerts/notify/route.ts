import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch unified alerts feed
    const { data: unified } = await supabase
      .from("alerts_unified")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    const alerts = unified?.unified_alerts || [];

    const prompt = `
You are an expert grant notification engine. Convert unified alerts into workspace notifications.

Unified Alerts:
${JSON.stringify(alerts, null, 2)}

Provide a JSON response:
{
  "notifications": [
    {
      "title": string,
      "body": string,
      "severity": "low" | "medium" | "high",
      "grantId": number,
      "type": "federal" | "state",
      "timestamp": string
    }
  ],
  "notificationSummary": string
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Store notifications
    await supabase.from("workspace_notifications").insert({
      workspace_id: workspaceId,
      notifications: result.notifications,
      notification_summary: result.notificationSummary,
    });

    return NextResponse.json({
      success: true,
      notifications: result.notifications,
      notificationSummary: result.notificationSummary,
    });
  } catch (err: any) {
    console.error("Workspace notification error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
