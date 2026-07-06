import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const warehouse = await prisma.application.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        grantId: true, // ⭐ REQUIRED — fixes TS error
        content: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            emailVerified: true,
            image: true,
            role: true,
            stripeCustomerId: true,
            planName: true,
            status: true,
            renewalDate: true
          }
        }
      }
    });

    const formatted = warehouse.map((a) => ({
      id: a.id,
      userId: a.userId,
      userEmail: a.user?.email ?? null,
      grantId: a.grantId,
      content: a.content,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error("EXPORT WAREHOUSE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export warehouse data" },
      { status: 500 }
    );
  }
}
