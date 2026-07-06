import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { applicationId, updates } = await req.json();

    if (!applicationId || !updates) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const app = await prisma.submissionHistory.update({
      where: { id: applicationId },
      data: updates,
    });

    return NextResponse.json({ updated: true, app });
  } catch (err: any) {
    console.error("Application update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
