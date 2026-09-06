import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/route-guards";

export async function POST(req: Request) {
  try {
    console.log("WORKSPACE CREATE START");

    const user = await requireUser();

    console.log("WORKSPACE USER:", {
      id: user.id,
      email: user.email,
    });

    const body = await req.json();

    console.log("WORKSPACE BODY:", body);

    const workspace = await prisma.workspace.create({
      data: {
        name: body.name || "New Workspace",
        ownerId: user.id,
        slug: body.slug || `ws-${Date.now()}`,

      billing: {
  create: {
   plan: "basic",
    seats: 1,
    aiTokensMonthly: 50000,
    aiTokensUsed: 0,
    documentLimit: 50,
    storageLimitMb: 500,
  },

},

        members: {
          create: {
            userId: user.id,
            role: "owner",
            status: "active",
          },
        },
      },
    });

    console.log("WORKSPACE CREATED:", workspace.id);

    return NextResponse.json({
      success: true,
      workspaceId: workspace.id,
      workspace,
    });
  } catch (error) {
    console.error("WORKSPACE CREATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown workspace creation error",
      },
      { status: 500 }
    );
  }
}