import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Checkout endpoint operational",
      routes: {
        simple: "/api/billing-endpoint/checkout/simple",
        seats: "/api/billing-endpoint/checkout/seats",
        addons: "/api/billing-endpoint/checkout/addons",
      },
    });
  } catch (err) {
    console.error("CHECKOUT ROOT ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
