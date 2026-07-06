import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "orgId is required" },
        { status: 400 }
      );
    }

    // ⭐ FIXED — use prisma.org instead of prisma.organization
    const org = await prisma.org.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      org,
    });
  } catch (error) {
    console.error("ORG BILLING ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load organization billing data" },
      { status: 500 }
    );
  }
}
