import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { applicationId, versionData } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing applicationId" },
        { status: 400 }
      );
    }

    // Get the next version number
    const existingVersions = await prisma.applicationVersion.count({
      where: { applicationId },
    });

    const nextVersion = existingVersions + 1;

    const entry = await prisma.applicationVersion.create({
      data: {
        applicationId,
        versionNumber: nextVersion,
        content: versionData,
      },
    });

    return NextResponse.json({ saved: true, entry });
  } catch (err: any) {
    console.error("Application version save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
