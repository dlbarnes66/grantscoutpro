import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { billing: true },
    });

    if (!workspace || !workspace.billing) {
      return NextResponse.json(
        { error: "Workspace or billing not found" },
        { status: 404 }
      );
    }

    const billing = workspace.billing;

    const newRenewal = new Date(billing.periodEnd);

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        billingRenewalDate: newRenewal,
      },
    });

    return NextResponse.json({
      updated: true,
      renewalDate: newRenewal,
    });
  } catch (err) {
    console.error("RENEWAL ROUTE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
