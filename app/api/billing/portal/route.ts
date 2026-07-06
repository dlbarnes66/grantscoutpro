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
    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Fetch workspace to get Stripe customer ID
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("stripe_customer_id")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      console.error("Workspace fetch error:", workspaceError);
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    if (!workspace.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "Workspace does not have a Stripe customer. Call create-customer first.",
        },
        { status: 400 }
      );
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?workspaceId=${workspaceId}`,
    });

    return NextResponse.json({
      success: true,
      portalUrl: session.url,
    });
  } catch (err: any) {
    console.error("Stripe billing portal error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
