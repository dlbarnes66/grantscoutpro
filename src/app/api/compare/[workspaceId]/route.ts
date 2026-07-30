import { NextResponse } from "next/server";
import { loadComparison } from "@/app/dashboard/lib/loadComparison";

export async function GET(
  req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await context.params;

  const data = await loadComparison(workspaceId);

  return NextResponse.json(data);
}
