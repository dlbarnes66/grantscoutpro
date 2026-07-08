// app/api/webhooks/clerk/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { email, id: clerkUserId } = payload.data;

    // 1. Create Org for this user
    const org = await prisma.org.create({
      data: {
        name: `${email}'s Org`,
      },
    });

    // 2. Create Workspace inside that Org
    const workspace = await prisma.workspace.create({
      data: {
        name: `${email}'s Workspace`,
        orgId: org.id, // ⭐ REQUIRED
        members: {
          create: {
            userId: clerkUserId,
            role: "owner",
          },
        },
      },
    });

    return NextResponse.json({ success: true, workspace });
  } catch (error) {
    console.error("CLERK WEBHOOK ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Webhook failed" },
      { status: 500 }
    );
  }
}
