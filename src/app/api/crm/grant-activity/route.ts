import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GrantActivity = {
  id: string;
  type:
    | "lead-created"
    | "lead-updated"
    | "opportunity-created"
    | "stage-changed"
    | "note-added";
  entityType: "lead" | "opportunity";
  entityId: string;
  description: string;
  createdAt: string;
};

const grantActivityStore: GrantActivity[] = [];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const entityId = url.searchParams.get("entityId");

  const activity = entityId
    ? grantActivityStore.filter((a) => a.entityId === entityId)
    : grantActivityStore;

  return NextResponse.json({ activity });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const type = body.type as GrantActivity["type"];
  const entityType = body.entityType as GrantActivity["entityType"];
  const entityId = body.entityId;
  const description = body.description ?? "";

  if (!type || !entityType || !entityId) {
    return NextResponse.json(
      { error: "type, entityType, and entityId required" },
      { status: 400 }
    );
  }

  const activity: GrantActivity = {
    id: crypto.randomUUID(),
    type,
    entityType,
    entityId,
    description,
    createdAt: new Date().toISOString()
  };

  grantActivityStore.push(activity);

  return NextResponse.json({ activity });
}
