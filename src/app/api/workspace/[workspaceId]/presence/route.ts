import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PresenceStatus = "online" | "away" | "offline";

type PresenceUser = {
  userId: string;
  name: string;
  status: PresenceStatus;
  lastSeen: number;
};

const presenceStore = new Map<string, PresenceUser[]>();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = params.workspaceId;

  const users = presenceStore.get(workspaceId) ?? [];

  const now = Date.now();

  const updated: PresenceUser[] = users.map((u) => ({
    ...u,
    status: now - u.lastSeen > 15000 ? "away" : "online"
  }));

  presenceStore.set(workspaceId, updated);

  return NextResponse.json({ workspaceId, users: updated });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = params.workspaceId;
  const body = await req.json().catch(() => ({}));

  const existing = presenceStore.get(workspaceId) ?? [];

  const newUser: PresenceUser = {
    userId,
    name: body.name ?? userId,
    status: "online",
    lastSeen: Date.now()
  };

  const updated: PresenceUser[] = [
    ...existing.filter((u) => u.userId !== userId),
    newUser
  ];

  presenceStore.set(workspaceId, updated);

  return NextResponse.json({ workspaceId, users: updated });
}
