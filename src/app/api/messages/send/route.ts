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

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const workspaceId = body.workspaceId;
  const content = body.content;

  if (!workspaceId || !content)
    return NextResponse.json({ error: "workspaceId and content required" }, { status: 400 });

  const message: Message = {
    id: crypto.randomUUID(),
    userId,
    content,
    createdAt: new Date().toISOString(),
    workspaceId
  };

  messageStore.push(message);

  return NextResponse.json({ message });
}
