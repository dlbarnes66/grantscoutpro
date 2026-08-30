import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
      include: {
        billing: true,
        owner: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.stripeCustomerId || workspace.billing?.stripeCustomerId) {
      return NextResponse.json({
        stripeCustomerId:
          workspace.stripeCustomerId ||
          workspace.billing?.stripeCustomerId,
        alreadyExists: true,
      });
    }

    const customer = await stripe.customers.create({
      email: workspace.owner?.email ?? undefined,
      name: workspace.name,
      metadata: {
        clerkOrgId: orgId,
        workspaceId: workspace.id,
      },
    });

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        stripeCustomerId: customer.id,
        billing: {
          upsert: {
            create: {
              workspaceId: workspace.id,
              stripeCustomerId: customer.id,
              plan: "basic",
              seats: 1,
            },
            update: {
              stripeCustomerId: customer.id,
            },
          },
        },
      },
    });

    return NextResponse.json({
      stripeCustomerId: customer.id,
      created: true,
    });
  } catch (err) {
    console.error("CREATE CUSTOMER ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
