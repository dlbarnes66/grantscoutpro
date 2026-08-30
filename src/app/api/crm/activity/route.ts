import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Activity = {
  id: string;
  type: string;
  entityType: "lead" | "contact" | "deal";
  entityId: string;
  description: string;
  createdAt: string;
};

const activityStore: Activity[] = [];

export async function GET() {
  return NextResponse.json({ activity: activityStore });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const type = body.type;
  const entityType = body.entityType as Activity["entityType"];
  const entityId = body.entityId;
  const description = body.description ?? "";

  if (!type || !entityType || !entityId) {
    return NextResponse.json(
      { error: "type, entityType, and entityId required" },
      { status: 400 }
    );
  }

  const activity: Activity = {
    id: crypto.randomUUID(),
    type,
    entityType,
    entityId,
    description,
    createdAt: new Date().toISOString()
  };

  activityStore.push(activity);

  return NextResponse.json({ activity });
}
