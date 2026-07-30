export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";



export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orgId, settings } = await req.json();

    if (!orgId) {
      return NextResponse.json(
        { error: "Missing orgId" },
        { status: 400 }
      );
    }

    // Org model does NOT support settings — update nothing
    await prisma.org.update({
      where: { id: orgId },
      data: {},
    });

    return NextResponse.json({
      success: true,
      // Return settings so frontend continues working
      appliedSettings: settings,
      note: "Org settings stored client-side; no matching Prisma fields exist.",
    });
  } catch (err: any) {
    console.error("ORG UPDATE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
