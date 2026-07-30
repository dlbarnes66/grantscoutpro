export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    const grants = await prisma.grant.findMany();

    let opened = 0;
    let closed = 0;

    for (const grant of grants) {
      // Close expired grants
      if (grant.deadline < now && grant.status !== "closed") {
        await prisma.grant.update({
          where: { id: grant.id },
          data: { status: "closed" },
        });
        closed++;
      }

      // Open grants whose openDate has arrived
      if (grant.openDate && grant.openDate <= now && grant.status === "upcoming") {
        await prisma.grant.update({
          where: { id: grant.id },
          data: { status: "open" },
        });
        opened++;
      }
    }

    return NextResponse.json({ opened, closed });
  } catch (err: any) {
    console.error("Lifecycle process error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
