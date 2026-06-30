import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function call(path: string, body: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return await res.json();
}

export async function POST(req: Request) {
  try {
    const { grants, profile } = await req.json();

    if (!grants || !profile) {
      return NextResponse.json({ error: "Missing grants or profile" }, { status: 400 });
    }

    // Extract deadlines
    const deadlines = [];
    for (const grant of grants) {
      deadlines.push(await call("/api/ai/calendar/extract-deadline", { grant }));
    }

    // Rank priorities
    const priorities = await call("/api/ai/calendar/priority", { grants, profile });

    // Build timelines
    const timelines = [];
    for (const grant of grants) {
      timelines.push(await call("/api/ai/calendar/timeline", { grant, profile }));
    }

    return NextResponse.json({
      deadlines,
      priorities,
      timelines
    });
  } catch (err: any) {
    console.error("Calendar build error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
