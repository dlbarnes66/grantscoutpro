export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";




export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        grantId: true,
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
            renewalDate: true,
          },
        },
      },
    });

    const formatted = applications.map((d) => ({
      id: d.id,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      userId: d.userId,
      userEmail: d.user?.email ?? null,
      grantId: d.grantId,
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("EXPORT APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export applications" },
      { status: 500 }
    );
  }
}
