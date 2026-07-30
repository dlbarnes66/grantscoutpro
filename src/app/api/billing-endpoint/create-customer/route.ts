import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { workspaceId } = await req.json();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (workspace.stripeCustomerId) {
    return NextResponse.json({ ok: true });
  }

  const customer = await stripe.customers.create({
    name: workspace.name,
  });

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { stripeCustomerId: customer.id },
  });

  return NextResponse.json({ ok: true });
}
