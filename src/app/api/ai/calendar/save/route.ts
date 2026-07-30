export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function POST(req: Request) {
  try {
    const { userId, events } = await req.json();

    if (!userId || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "userId and events[] are required" },
        { status: 400 }
      );
    }

    // Stubbed: your schema has no calendarEvent model.
    // No database writes are performed.
    const saved = events.map((event, idx) => ({
      id: `stub-calendar-${idx}`,
      userId,
      title: event.title,
      start: event.start,
      end: event.end,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({ saved });
  } catch (err: any) {
    console.error("AI calendar save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
