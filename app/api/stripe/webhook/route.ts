// app/api/stripe/webhook/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendTrialEmail } from "@/lib/notifications/trial-email";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("WEBHOOK SIGNATURE ERROR:", err);
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    // ============================================================
    // ⭐ SUBSCRIPTION CREATED / UPDATED (MAIN PLAN + ADDONS)
    // ============================================================
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      const workspaceId = subscription.metadata.workspaceId;
      const addonType = subscription.metadata.addonType; // optional

      if (!workspaceId) {
        console.error("Missing workspaceId in subscription metadata");
        return NextResponse.json({ received: true });
      }

      // ============================================================
      // ⭐ MAIN PLAN SUBSCRIPTION (NO addonType)
      // ============================================================
      if (!addonType) {
        const workspace = await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            trialActive: false,
            trialLocked: false,
          },
          include: { owner: true },
        });

        await prisma.workspaceBilling.update({
          where: { workspaceId },
          data: {
            plan: subscription.items.data[0].price.nickname || "paid",
            stripeSubscriptionId: subscription.id,
            periodStart: new Date(subscription.current_period_start * 1000),
            periodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // ⭐ Notify owner
        await sendTrialEmail(
          workspace.owner.email,
          "Your workspace has been unlocked",
          "Your subscription is active and your trial has been unlocked."
        );

        console.log("Main subscription synced + trial unlocked");
      }

      // ============================================================
      // ⭐ ADDON SUBSCRIPTION (addonType present)
      // ============================================================
      if (addonType) {
        await prisma.addonBilling.upsert({
          where: {
            workspaceId_addonType: {
              workspaceId,
              addonType,
            },
          },
          update: {
            stripeSubscriptionId: subscription.id,
            periodStart: new Date(subscription.current_period_start * 1000),
            periodEnd: new Date(subscription.current_period_end * 1000),
          },
          create: {
            workspaceId,
            addonType,
            stripeSubscriptionId: subscription.id,
            periodStart: new Date(subscription.current_period_start * 1000),
            periodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        await prisma.workspaceAddon.upsert({
          where: {
            workspaceId_type: {
              workspaceId,
              type: addonType,
            },
          },
          update: { active: true },
          create: {
            workspaceId,
            type: addonType,
            active: true,
          },
        });

        console.log(`Addon ${addonType} activated for workspace ${workspaceId}`);
      }
    }

    // ============================================================
    // ⭐ SUBSCRIPTION DELETED (MAIN PLAN + ADDONS)
    // ============================================================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const workspaceId = subscription.metadata.workspaceId;
      const addonType = subscription.metadata.addonType;

      if (!workspaceId) {
        console.error("Missing workspaceId in subscription metadata");
        return NextResponse.json({ received: true });
      }

      // ============================================================
      // ⭐ MAIN PLAN CANCELLED
      // ============================================================
      if (!addonType) {
        const workspace = await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            trialLocked: true,
          },
          include: { owner: true },
        });

        await prisma.workspaceBilling.update({
          where: { workspaceId },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
          },
        });

        await sendTrialEmail(
          workspace.owner.email,
          "Your workspace has been locked",
          "Your subscription ended and your workspace is now locked."
        );

        console.log("Main subscription deleted + workspace locked");
      }

      // ============================================================
      // ⭐ ADDON CANCELLED
      // ============================================================
      if (addonType) {
        await prisma.workspaceAddon.updateMany({
          where: { workspaceId, type: addonType },
          data: { active: false },
        });

        await prisma.addonBilling.updateMany({
          where: { workspaceId, addonType },
          data: {
            stripeSubscriptionId: null,
          },
        });

        console.log(`Addon ${addonType} deactivated for workspace ${workspaceId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("STRIPE WEBHOOK ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
