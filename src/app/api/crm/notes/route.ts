import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Note = {
  id: string;
  entityType: "lead" | "contact" | "deal";
  entityId: string;
  text: string;
  createdAt: string;
};

const noteStore: Note[] = [];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const entityId = url.searchParams.get("entityId");

  if (!entityId) {
    return NextResponse.json(
      { error: "entityId required" },
      { status: 400 }
    );
  }

  const notes = noteStore.filter((n) => n.entityId === entityId);

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const entityType = body.entityType as Note["entityType"];
  const entityId = body.entityId;
  const text = body.text;

  if (!entityType || !entityId || !text) {
    return NextResponse.json(
      { error: "entityType, entityId, and text required" },
      { status: 400 }
    );
  }

  const note: Note = {
    id: crypto.randomUUID(),
    entityType,
    entityId,
    text,
    createdAt: new Date().toISOString()
  };

  noteStore.push(note);

  return NextResponse.json({ note });
}
