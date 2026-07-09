import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCompletion } from "@/lib/ai/llm";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const workspaceId = params.workspaceId;

    // Recent documents
    const documents = await prisma.file.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Recent searches
    const searches = await prisma.searchHistory.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // AI summary
    const summaryPrompt = `
Summarize the recent activity in this workspace.

Documents:
${documents.map((d) => `- ${d.name}`).join("\n")}

Searches:
${searches.map((s) => `- ${s.query}`).join("\n")}

Provide a short, helpful summary.
`;

    const summary = await generateCompletion(summaryPrompt);

    return NextResponse.json({
      documents,
      searches,
      summary,
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
