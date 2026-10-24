import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/security/cronAuth";
import { sendEmailSafe } from "@/lib/email/sendgrid";
import { getTrialState, trialDiscountAvailable, TRIAL_DISCOUNT_PERCENT } from "@/lib/billing/trial";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Daily job for the 14-day free trial. Emails each unsubscribed trial account
// once when the discount window opens (last 5 days) and once when the trial
// ends and the account locks. Each email is recorded in BillingLog so reruns
// never send twice. The lock itself needs no write: it is derived from the
// trial dates and enforced in src/proxy.ts.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.grantscoutpro.com";

async function run() {
  const orgs = await prisma.org.findMany({
    where: { billingStatus: "trial", stripeSubscriptionId: null, pilotEndsAt: { not: null } },
    select: {
      id: true,
      billingStatus: true,
      stripeSubscriptionId: true,
      pilotEndsAt: true,
      users: { select: { email: true, name: true }, take: 5 },
    },
  });

  let offers = 0;
  let locks = 0;
  for (const org of orgs) {
    const state = getTrialState(org);
    const kind = state.locked ? "trial_locked_email" : state.discountWindowOpen ? "trial_discount_email" : null;
    if (!kind) continue;

    const already = await prisma.billingLog.findFirst({ where: { orgId: org.id, type: kind }, select: { id: true } });
    if (already) continue;

    const to = org.users.find((u) => u.email)?.email;
    if (!to) continue;

    const offer = trialDiscountAvailable(state);
    const subject = state.locked
      ? "Your Grant Scout Pro trial has ended"
      : `Your trial ends in ${state.daysRemaining} days${offer ? ` - take ${TRIAL_DISCOUNT_PERCENT}% off` : ""}`;
    const body = state.locked
      ? `Your 14-day free trial has ended and your account is locked. Your workspaces and data are safe. Choose a plan to get back in: ${APP_URL}/billing`
      : `Your free trial ends in ${state.daysRemaining} days. ${
          offer ? `Subscribe before it ends and ${TRIAL_DISCOUNT_PERCENT}% off is applied at checkout. ` : ""
        }Choose a plan: ${APP_URL}/billing`;

    const res = await sendEmailSafe({
      to,
      subject,
      text: body,
      html: `<p>${body.replace(APP_URL + "/billing", `<a href="${APP_URL}/billing">${APP_URL}/billing</a>`)}</p>`,
    });
    if (!res.ok) continue;

    await prisma.billingLog.create({ data: { orgId: org.id, type: kind, message: `sent to ${to}` } });
    if (state.locked) locks++;
    else offers++;
  }
  return { checked: orgs.length, offers, locks };
}

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  if (!isAuthorizedCronRequest(req, secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await run());
  } catch (err: any) {
    console.error("TRIAL CHECK ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export const POST = handle;
export const GET = handle;
