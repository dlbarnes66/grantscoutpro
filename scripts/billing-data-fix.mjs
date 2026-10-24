// scripts/billing-data-fix.mjs
//
// One-time data clean-up from the 24 Oct 2026 platform diagnostic
// (findings F-06 and F-11). Safe by default: it only REPORTS what it
// would change. Nothing is written unless you pass --apply.
//
//   node scripts/billing-data-fix.mjs            # dry run, prints a plan
//   node scripts/billing-data-fix.mjs --apply    # makes the changes
//
// It uses whatever DATABASE_URL your environment points at. Run the dry
// run first and read the output. Changes it makes:
//
//   1. Workspaces with no WorkspaceBilling row get one, with the plan
//      taken from the owner's organization tier (or "basic").
//      Without this row every /api/workspaces/... call returns HTTP 500.
//   2. Billing rows using retired plan ids are mapped to current ones:
//      free -> basic, starter -> basic, pro -> team. (The app already
//      treats unknown ids as Basic, so this only fixes reporting.)
//
// Usage limits and Stripe ids are never touched.

import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const LEGACY = { free: "basic", starter: "basic", pro: "team" };
const prisma = new PrismaClient();

try {
  const missing = await prisma.workspace.findMany({
    where: { billing: null },
    select: { id: true, name: true, org: { select: { tier: true } } },
  });
  console.log(`Workspaces with no billing row: ${missing.length}`);
  for (const w of missing) {
    const raw = w.org?.tier ?? "basic";
    const plan = LEGACY[raw] ?? raw;
    console.log(`  - ${w.id} "${w.name}" -> create billing row, plan "${plan}"`);
    if (APPLY) await prisma.workspaceBilling.create({ data: { workspaceId: w.id, plan } });
  }

  for (const [from, to] of Object.entries(LEGACY)) {
    const n = await prisma.workspaceBilling.count({ where: { plan: from } });
    console.log(`Billing rows with legacy plan "${from}": ${n} -> "${to}"`);
    if (APPLY && n > 0) await prisma.workspaceBilling.updateMany({ where: { plan: from }, data: { plan: to } });
  }

  console.log(APPLY ? "Done. Changes applied." : "Dry run only. Re-run with --apply to make these changes.");
} finally {
  await prisma.$disconnect();
}
