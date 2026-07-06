import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
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

    // Fetch grants
    const { data: grants, error: grantsError } = await supabase
      .from("grants")
      .select("title, agency, deadline, summary")
      .eq("workspace_id", workspaceId);

    if (grantsError) {
      console.error("Dashboard AI grants fetch error:", grantsError);
    }

    // Fetch structured extractions
    const { data: structured, error: structuredError } = await supabase
      .from("vault_structured")
      .select("structured_data")
      .eq("workspace_id", workspaceId);

    if (structuredError) {
      console.error("Dashboard AI structured fetch error:", structuredError);
    }

    // Build AI context
    const grantSummaries = (grants || [])
      .map(
        (g) =>
          `Grant: ${g.title}\nAgency: ${g.agency}\nDeadline: ${g.deadline}\nSummary: ${g.summary}`
      )
      .join("\n\n");

    const structuredSummaries = (structured || [])
      .map((s) => JSON.stringify(s.structured_data, null, 2))
      .join("\n\n");

    const aiPrompt = `
You are generating dashboard insights for a grant management workspace.

Provide:
1. A short summary of workspace activity.
2. Key opportunities based on grants + documents.
3. Risks or deadlines approaching.
4. Recommended next steps.
5. A confidence score (0–100).

Workspace Grants:
${grantSummaries || "No grants found."}

Structured Document Data:
${structuredSummaries || "No structured documents found."}
`;

    // AI call
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate concise, helpful dashboard insights. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: aiPrompt,
        },
      ],
      temperature: 0.3,
    });

    let insights;
    try {
      insights = JSON.parse(aiResponse.choices[0].message.content || "{}");
    } catch (err) {
      console.error("AI JSON parse error:", err);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (err: any) {
    console.error("Dashboard AI route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
