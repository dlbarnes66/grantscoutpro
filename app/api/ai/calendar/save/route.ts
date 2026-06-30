import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, events } = await req.json();

    if (!userId || !events) {
      return NextResponse.json({ error: "Missing userId or events" }, { status: 400 });
    }

    const saved = [];

    for (const event of events) {
      const entry = await prisma.calendarEvent.create({
        data: {
          userId,
          title: event.title,
          date: new Date(event.date),
          description: event.description ?? ""
        }
      });

      saved.push(entry);
    }

    return NextResponse.json({ saved });
  } catch (err: any) {
    console.error("Calendar save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
