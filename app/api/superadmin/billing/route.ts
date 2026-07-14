import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { isSuperAdmin } from "@/lib/security/super-admin";
import Stripe from "stripe";
import { auditEvent } from "@/lib/audit/log";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function GET(req) {
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
      planName: true,
      status: true,
      renewalDate: true,
    },
  });

  const customers = [];
  for (const u of users) {
    if (!u.stripeCustomerId) continue;

    const subs = await stripe.subscriptions.list({
      customer: u.stripeCustomerId,
      limit: 5,
    });

    customers.push({
      user: u,
      subscriptions: subs.data,
    });
  }

  return NextResponse.json(customers);
}

export async function POST(req) {
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, payload } = await req.json();

  let result;

  switch (action) {
    case "cancelSubscription":
      result = await stripe.subscriptions.update(payload.subscriptionId, {
        cancel_at_period_end: true,
      });
      break;

    case "extendTrial":
      result = await stripe.subscriptions.update(payload.subscriptionId, {
        trial_end: payload.newTrialEnd,
      });
      break;

    case "applyCredit":
      result = await stripe.customers.createBalanceTransaction(payload.customerId, {
        amount: -payload.amount,
        currency: "usd",
        description: payload.description ?? "Manual credit",
      });
      break;

    default:
      return NextResponse.json({ error: "Unknown billing action" }, { status: 400 });
  }

  await auditEvent({
    actorId: userId,
    orgId: null,
    action: `superadmin.billing.${action}`,
    entity: "billing",
    entityId: payload.subscriptionId ?? payload.customerId,
    metadata: payload,
  });

  return NextResponse.json({ ok: true, result });
}
