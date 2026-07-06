import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, email, workspaceId } = await req.json();

    if (!userId || !email || !workspaceId) {
      return NextResponse.json(
        { error: "userId, email, and workspaceId are required" },
        { status: 400 }
      );
    }

    // Check if workspace already has a Stripe customer
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("stripe_customer_id")
      .eq("id", workspaceId)
      .single();

    if (workspaceError) {
      console.error("Fetch workspace error:", workspaceError);
      return NextResponse.json(
        { error: "Workspace lookup failed" },
        { status: 500 }
      );
    }

    if (workspace?.stripe_customer_id) {
      return NextResponse.json({
        success: true,
        stripeCustomerId: workspace.stripe_customer_id,
        message: "Stripe customer already exists.",
      });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
        workspaceId,
      },
    });

    // Save to Supabase
    const { error: updateError } = await supabase
      .from("workspaces")
      .update({ stripe_customer_id: customer.id })
      .eq("id", workspaceId);

    if (updateError) {
      console.error("Stripe customer save error:", updateError);
      return NextResponse.json(
        { error: "Failed to save Stripe customer ID" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stripeCustomerId: customer.id,
    });
  } catch (err: any) {
    console.error("Create Stripe customer error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
