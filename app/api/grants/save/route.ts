import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId, grantId, title, agency, url } = await req.json();

    if (!userId || !grantId) {
      return NextResponse.json(
        { success: false, error: "userId and grantId are required" },
        { status: 400 }
      );
    }

    const saved = await prisma.savedGrant.create({
      data: {
        userId,
        grantId,
        title,
        agency,
        url,
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("SAVE GRANT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save grant" },
      { status: 500 }
    );
  }
}
