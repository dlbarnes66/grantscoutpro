export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { userId, grantId, submittedAt } = await req.json();

    if (!userId || !grantId) {
      return NextResponse.json(
        { error: "Missing userId or grantId" },
        { status: 400 }
      );
    }

    const entry = await prisma.submissionHistory.create({
      data: {
        userId,
        grantId,
        submittedAt,
      },
    });

    return NextResponse.json({ saved: true, entry });
  } catch (err: any) {
    console.error("Submission history save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
