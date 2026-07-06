import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Stubbed: no comparisonHistory model exists in your Prisma schema.
    const history = [
      {
        id: "stub-comparison-1",
        userId,
        createdAt: new Date().toISOString(),
        summary: "Comparison history stubbed — no database model exists.",
      },
    ];

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("Comparison history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
