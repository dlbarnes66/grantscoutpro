// scripts/grant-trials.mjs
//
// Gives the 14-day Business free trial to accounts that signed up before
// the trial was switched on (new accounts get it automatically). Safe by
// default: it only REPORTS what it would do unless you pass --apply.
//
//   node scripts/grant-trials.mjs --email someone@example.org            # one person (dry run)
//   node scripts/grant-trials.mjs --email someone@example.org --apply
//   node scripts/grant-trials.mjs --since-days 14 --apply                 # everyone who signed up in the last 14 days
//
// Only accounts with no Stripe subscription and no pilot or trial already on
// file are touched. Paid customers are never changed. The trial starts now
// and lasts 14 days. Uses whatever DATABASE_URL your environment points at.

import { PrismaClient } from "@prisma/client";

const TRIAL_DAYS = 14;
const TRIAL_TIER = "business";
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const email = arg("--email");
const sinceDays = arg("--since-days") ? Number(arg("--since-days")) : undefined;

if (!email && !sinceDays) {
  console.error("Pass --email <address> or --since-days <n>. Nothing was changed.");
  process.exit(1);
}

const prisma = new PrismaClient();
const now = new Date();
const ends = new Date(now.getTime() + TRIAL_DAYS * 24 * 3600 * 1000);

try {
  const where = {
    OR: [{ tier: null }, { tier: "basic" }, { tier: "free" }],
    stripeSubscriptionId: null,
    pilotTier: null,
    ...(sinceDays ? { createdAt: { gte: new Date(now.getTime() - sinceDays * 24 * 3600 * 1000) } } : {}),
    ...(email ? { users: { some: { email: email.toLowerCase() } } } : {}),
  };
  const orgs = await prisma.org.findMany({ where, select: { id: true, name: true, createdAt: true, users: { select: { email: true } } } });
  console.log(`Accounts eligible for a ${TRIAL_DAYS}-day ${TRIAL_TIER} trial: ${orgs.length}`);
  for (const o of orgs) {
    console.log(`  - ${o.name} (${o.users.map((u) => u.email).join(", ") || "no users"}), created ${o.createdAt.toISOString().slice(0, 10)}`);
    if (APPLY) {
      await prisma.org.update({ where: { id: o.id }, data: { pilotTier: TRIAL_TIER, pilotStart: now, pilotEndsAt: ends, billingStatus: "trial" } });
    }
  }
  console.log(APPLY ? `Done. Trials run until ${ends.toISOString().slice(0, 10)}. These accounts LOCK after that unless they subscribe.` : "Dry run only. Re-run with --apply to grant these trials.");
} finally {
  await prisma.$disconnect();
}
