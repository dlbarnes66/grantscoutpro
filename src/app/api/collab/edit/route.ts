import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CollaborationDoc = {
  workspaceId: string;
  content: string;
  updatedAt: string;
};

const docStore = new Map<string, CollaborationDoc>();

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("workspaceId");

  if (!workspaceId)
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const doc =
    docStore.get(workspaceId) ??
    {
      workspaceId,
      content: "",
      updatedAt: new Date().toISOString()
    };

  return NextResponse.json(doc);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const workspaceId = body.workspaceId;
  const content = body.content;

  if (!workspaceId)
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const doc: CollaborationDoc = {
    workspaceId,
    content,
    updatedAt: new Date().toISOString()
  };

  docStore.set(workspaceId, doc);

  return NextResponse.json(doc);
}
