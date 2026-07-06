import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const versions = await prisma.submissionVersion.findMany({
      where: { submissionId: applicationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ versions });
  } catch (err: any) {
    console.error("Application version list error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
