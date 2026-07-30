import { NextResponse } from "next/server";
import { searchGrants } from "@/app/dashboard/lib/searchGrants";

export async function GET(
  req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await context.params;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const results = await searchGrants(workspaceId, q);

  return NextResponse.json(results);
}
