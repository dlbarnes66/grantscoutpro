import { prisma } from "@/lib/prisma";
import { aiComplete } from "@/lib/ai/complete"; // your existing LLM wrapper

export async function generateInsights(workspaceId: string) {
  // Fetch recent activity
  const activity = await prisma.workspaceActivity.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch search analytics
  const analytics = await prisma.searchAnalytics.findMany({
    where: { workspaceId },
    orderBy: { count: "desc" },
    take: 20,
  });

  const prompt = `
You are an AI analyst for a workspace platform.

Here is the recent activity:
${JSON.stringify(activity, null, 2)}

Here are the top search queries:
${JSON.stringify(analytics, null, 2)}

Generate:
1. A summary of workspace behavior
2. Key trends
3. Opportunities
4. Risks or gaps
5. A short actionable recommendation list

Return JSON with:
{
  "summary": "...",
  "trends": [...],
  "opportunities": [...],
  "risks": [...],
  "recommendations": [...]
}
`;

  const ai = await aiComplete(prompt);

  return JSON.parse(ai);
}
