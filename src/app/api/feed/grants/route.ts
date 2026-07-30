import { NextResponse } from "next/server";
import { getFeedData } from "@/lib/feed/getFeedData";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const workspaceId = searchParams.get("workspaceId") || null;
  const userId = searchParams.get("userId") || null;

  const data = await getFeedData({ workspaceId, userId });

  return NextResponse.json(data);
}
