import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { grantId, status, notes, priority } = await req.json();

    const updated = await prisma.grant.update({
      where: { id: grantId },
      data: {
        status,
        notes,
        priority,
        statusHistory: {
          push: `${new Date().toISOString()} — Status changed to: ${status}`
        }
      }
    });

    return NextResponse.json({ success: true, grant: updated });
  } catch (error) {
    console.error("Grant Status Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update grant status" },
      { status: 500 }
    );
  }
}
