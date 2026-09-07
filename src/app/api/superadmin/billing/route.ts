import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/security/super-admin";
import { getPlan } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId || !(await isSuperAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const billingRows = await prisma.workspaceBilling.findMany({
    select: { plan: true },
  });

  let totalRevenue = 0;
  let activeSubscriptions = 0;

  for (const row of billingRows) {
    if (row.plan && row.plan !== "free") {
      const plan = getPlan(row.plan);
      if (plan?.monthlyPrice) {
        activeSubscriptions += 1;
        totalRevenue += plan.monthlyPrice;
      }
    }
  }

  // Best-effort: ask Stripe directly for anything past-due/unpaid so this
  // number reflects real payment problems, not just local plan strings.
  // Falls back to 0 if Stripe isn't reachable (e.g. no live data yet).
  let failedPayments = 0;
  try {
    const [pastDue, unpaid] = await Promise.all([
      stripe.subscriptions.list({ status: "past_due", limit: 100 }),
      stripe.subscriptions.list({ status: "unpaid", limit: 100 }),
    ]);
    failedPayments = pastDue.data.length + unpaid.data.length;
  } catch (err) {
    console.error("Superadmin billing: Stripe lookup failed:", err);
  }

  return NextResponse.json({
    totalRevenue,
    activeSubscriptions,
    failedPayments,
    mrr: totalRevenue,
  });
}
