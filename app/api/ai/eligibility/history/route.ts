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

    // Stubbed: no eligibilityHistory model exists in your Prisma schema.
    const history = [
      {
        id: "stub-eligibility-1",
        userId,
        createdAt: new Date().toISOString(),
        grant: {
          id: "stub-grant-1",
          title: "Stubbed eligibility history entry",
        },
        summary: "Eligibility history is not persisted — this is a stub response.",
      },
    ];

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("Eligibility history error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
