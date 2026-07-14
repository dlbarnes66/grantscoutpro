import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/ai/semantic-search";
import { sendNotification } from "@/lib/notifications/sendNotification";
import { logActivity } from "@/lib/ai/activity-log";
import { logSearch } from "@/lib/analytics/logSearch";
import { requireWorkspaceRole } from "@/lib/auth/workspace-permissions";
import { checkUsage } from "@/lib/billing/check-usage";
import { incrementUsage } from "@/lib/billing/increment-usage";

export async function POST(req: Request, { params }) {
  try {
    await requireWorkspaceRole(params.workspaceId, ["ADMIN", "MEMBER"]);

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const usage = await checkUsage(params.workspaceId, "searches");
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Search limit reached",
          upgrade: true,
          plan: usage.plan,
          limit: usage.limit,
        },
        { status: 402 }
      );
    }

    const results = await semanticSearch({
      workspaceId: params.workspaceId,
      query,
    });

    await incrementUsage(params.workspaceId, "searches");

    await logSearch(params.workspaceId, query);
    await logActivity(params.workspaceId, "semantic_search", {
      query,
      resultCount: results.results.length,
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
