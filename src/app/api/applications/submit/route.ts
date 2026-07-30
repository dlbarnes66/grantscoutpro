export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {
  try {
    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const app = await prisma.submissionHistory.update({
      where: { id: applicationId },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ submitted: true, app });
  } catch (err: any) {
    console.error("Application submit error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
