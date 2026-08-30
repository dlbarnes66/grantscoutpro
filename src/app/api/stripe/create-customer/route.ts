import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { billing: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.billing?.stripeCustomerId) {
      return NextResponse.json({
        created: false,
        customerId: workspace.billing.stripeCustomerId,
      });
    }

    // FIX: Use Clerk user email instead of ownerEmail
    const customer = await stripe.customers.create({
      email: workspace.ownerId ? undefined : undefined, // no ownerEmail in schema
      metadata: {
        workspaceId,
        clerkOrgId: orgId,
      },
    });

    await prisma.workspaceBilling.update({
      where: { id: workspace.billing!.id },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return NextResponse.json({
      created: true,
      customerId: customer.id,
    });
  } catch (err: any) {
    console.error("CREATE CUSTOMER ERROR:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
