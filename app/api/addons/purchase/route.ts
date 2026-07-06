// app/api/addons/purchase/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ADDON_CAPABILITIES } from "@/lib/addonCapabilities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { addon, workspaceId } = await req.json();

    if (!addon || !workspaceId) {
      return NextResponse.json(
        { success: false, error: "addon and workspaceId are required" },
        { status: 400 }
      );
    }

    // Validate addon key
    const validAddonKeys = Object.keys(ADDON_CAPABILITIES);

    if (!validAddonKeys.includes(addon)) {
      return NextResponse.json(
        { success: false, error: "Invalid addon key" },
        { status: 400 }
      );
    }

    // ⭐ FIX: Remove apiVersion entirely
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: ADDON_CAPABILITIES[addon].name,
              description: ADDON_CAPABILITIES[addon].description,
            },
            unit_amount: 500, // example price: $5.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL}/billing/success?addon=${addon}`,
      cancel_url: `${process.env.APP_URL}/billing/cancel`,
      metadata: {
        addon,
        workspaceId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("ADDON PURCHASE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create purchase session" },
      { status: 500 }
    );
  }
}
