import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Message = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  workspaceId: string;
};

const messageStore: Message[] = [];

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");

  if (!workspaceId)
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const messages = messageStore.filter((m) => m.workspaceId === workspaceId);

  return NextResponse.json({ workspaceId, messages });
}
