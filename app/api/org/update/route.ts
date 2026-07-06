import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { orgId, settings } = await req.json();

    if (!orgId || !settings) {
      return NextResponse.json(
        { success: false, error: "orgId and settings are required" },
        { status: 400 }
      );
    }

    // ⭐ FIXED — your schema uses Org, NOT Organization
    await prisma.org.update({
      where: { id: orgId },
      data: { settings },
    });

    return NextResponse.json({
      success: true,
      updated: true,
    });
  } catch (error) {
    console.error("ORG UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update organization settings" },
      { status: 500 }
    );
  }
}
