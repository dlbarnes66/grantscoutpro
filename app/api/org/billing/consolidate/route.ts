import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { parentOrgId } = await req.json();

    if (!parentOrgId) {
      return NextResponse.json(
        { success: false, error: "parentOrgId is required" },
        { status: 400 }
      );
    }

    // ⭐ FIXED — use prisma.org instead of prisma.organization
    const parent = await prisma.org.findUnique({
      where: { id: parentOrgId },
    });

    if (!parent) {
      return NextResponse.json(
        { success: false, error: "Parent organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      parent,
    });
  } catch (error) {
    console.error("ORG BILLING CONSOLIDATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to consolidate billing" },
      { status: 500 }
    );
  }
}
