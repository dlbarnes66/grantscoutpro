import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/ai/semantic-search";
import { sendNotification } from "@/lib/notifications/sendNotification";
import { logActivity } from "@/lib/ai/activity-log";
import { logSearch } from "@/lib/analytics/logSearch";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // ⭐ Perform semantic search
    const results = await semanticSearch({
      workspaceId: params.workspaceId,
      query,
    });

    // ⭐ Log search analytics (Step 11)
    await logSearch(params.workspaceId, query);

    // ⭐ Log activity
    await logActivity(params.workspaceId, "semantic_search", {
      query,
      resultCount: results.results.length,
    });

    // ⭐ Send notification
    await sendNotification(
      params.workspaceId,
      "semantic_search",
      `Search performed: "${query}"`,
      {
        query,
        resultCount: results.results.length,
      }
    );

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
