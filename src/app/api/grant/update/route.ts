import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { grantId, updates } = await req.json();

    const grant = await prisma.grant.update({
      where: { id: grantId },
      data: updates,
    });

    return NextResponse.json(grant);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update grant" },
      { status: 500 }
    );
  }
}
