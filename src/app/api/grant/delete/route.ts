import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { grantId } = await req.json();

    await prisma.grant.delete({
      where: { id: grantId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete grant" },
      { status: 500 }
    );
  }
}
