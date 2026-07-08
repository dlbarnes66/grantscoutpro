import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId, orgId } = await req.json();

    if (!userId || !orgId) {
      return NextResponse.json(
        { success: false, error: "userId and orgId are required" },
        { status: 400 }
      );
    }

    // ⭐ FIXED — your schema uses WorkspaceMember, NOT TeamMember
    const member = await prisma.workspaceMember.findFirst({
      where: { userId, orgId },
    });

    if (!member) {
      return NextResponse.json({
        success: false,
        allowed: false,
        reason: "User is not a member of this organization",
      });
    }

    return NextResponse.json({
      success: true,
      allowed: true,
      member,
    });
  } catch (error) {
    console.error("STRICT CHECK ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check strict permission" },
      { status: 500 }
    );
  }
}
