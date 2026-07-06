import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, goal, steps, results } = await req.json();

    if (!userId || !goal) {
      return NextResponse.json(
        { error: "userId and goal are required" },
        { status: 400 }
      );
    }

    // Stubbed: no agentHistory model in your Prisma schema.
    // No database writes are performed.
    const entry = {
      id: "stub-agent-history",
      userId,
      goal,
      steps: steps ?? [],
      results: results ?? null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ entry });
  } catch (err: any) {
    console.error("Agent history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
