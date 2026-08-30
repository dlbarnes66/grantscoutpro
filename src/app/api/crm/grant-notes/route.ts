import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GrantNote = {
  id: string;
  entityType: "lead" | "opportunity";
  entityId: string;
  text: string;
  createdAt: string;
};

const grantNoteStore: GrantNote[] = [];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const entityId = url.searchParams.get("entityId");

  if (!entityId) {
    return NextResponse.json(
      { error: "entityId required" },
      { status: 400 }
    );
  }

  const notes = grantNoteStore.filter((n) => n.entityId === entityId);

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const entityType = body.entityType as GrantNote["entityType"];
  const entityId = body.entityId;
  const text = body.text;

  if (!entityType || !entityId || !text) {
    return NextResponse.json(
      { error: "entityType, entityId, and text required" },
      { status: 400 }
    );
  }

  const note: GrantNote = {
    id: crypto.randomUUID(),
    entityType,
    entityId,
    text,
    createdAt: new Date().toISOString()
  };

  grantNoteStore.push(note);

  return NextResponse.json({ note });
}
