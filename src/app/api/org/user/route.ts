export const dynamic = "force-dynamic";

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

    const users = await prisma.workspaceMember.findMany({
      where: {
        workspace: {
          orgId,
        },
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("ORG USER LIST ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list organization users" },
      { status: 500 }
    );
  }
}
