export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";




export async function GET() {
  try {
    // Prevent Supabase from initializing during Next.js build
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase environment variables missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch developer stats
    const { data: apiKeys, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("*");

    if (apiKeyError) {
      console.error("Developer summary API key error:", apiKeyError);
      return NextResponse.json(
        { error: "Failed to load API keys" },
        { status: 500 }
      );
    }

    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select("*");

    if (customerError) {
      console.error("Developer summary customer error:", customerError);
      return NextResponse.json(
        { error: "Failed to load customers" },
        { status: 500 }
      );
    }

    const { data: subscriptions, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*");

    if (subscriptionError) {
      console.error("Developer summary subscription error:", subscriptionError);
      return NextResponse.json(
        { error: "Failed to load subscriptions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary: {
        apiKeys,
        customers,
        subscriptions
      }
    });
  } catch (err: any) {
    console.error("Developer summary route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
