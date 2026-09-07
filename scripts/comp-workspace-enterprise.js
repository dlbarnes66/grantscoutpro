// scripts/comp-workspace-enterprise.js
//
// One-time admin utility: comps a workspace onto the Enterprise plan
// for free, forever. This writes directly to WorkspaceBilling.plan --
// the actual field every live gating check reads (see src/lib/plans.ts
// and its callers in grants/search-now, invite, and members/add) -- so
// it genuinely unlocks unlimited seats, unlimited manual searches, and
// federal+state+foundation+CRM access, not just a cosmetic label.
//
// No Stripe subscription is created or touched. This account is never
// billed and never expires (periodEnd is cleared).
//
// Run this yourself, on your own machine, since it talks directly to
// the production database:
//
//   node scripts/comp-workspace-enterprise.js                 (auto-detect by owner email below)
//   node scripts/comp-workspace-enterprise.js <workspaceId>   (target a specific workspace)

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Change this if you want to comp a workspace owned by a different account.
const OWNER_EMAIL = "dlbarnes@vcgnow.com";

async function main() {
  const targetId = process.argv[2];

  let workspace;

  if (targetId) {
    workspace = await prisma.workspace.findUnique({
      where: { id: targetId },
      include: { billing: true, owner: { select: { email: true } } },
    });
    if (!workspace) {
      console.error(`No workspace found with id ${targetId}`);
      process.exit(1);
    }
  } else {
    const candidates = await prisma.workspace.findMany({
      where: { owner: { email: { equals: OWNER_EMAIL, mode: "insensitive" } } },
      include: { billing: true, owner: { select: { email: true } } },
      orderBy: { createdAt: "asc" },
    });

    if (candidates.length === 0) {
      console.error(`No workspace found owned by ${OWNER_EMAIL}.`);
      process.exit(1);
    }

    if (candidates.length > 1) {
      console.log(
        `Found ${candidates.length} workspaces owned by ${OWNER_EMAIL} -- rerun with the id of the one you want:\n`
      );
      for (const w of candidates) {
        console.log(
          `  ${w.id}  "${w.name}"  (slug: ${w.slug}, current plan: ${w.billing?.plan ?? "none"})`
        );
      }
      process.exit(1);
    }

    workspace = candidates[0];
  }

  console.log(`Comping workspace "${workspace.name}" (slug: ${workspace.slug}, id: ${workspace.id})`);
  console.log(
    `Current billing: ${
      workspace.billing ? JSON.stringify({ plan: workspace.billing.plan, status: workspace.billing.status }) : "none"
    }`
  );

  const updated = await prisma.workspaceBilling.upsert({
    where: { workspaceId: workspace.id },
    update: {
      plan: "enterprise",
      status: "active",
      cancelAtPeriodEnd: false,
      periodEnd: null,
      seats: 999,
      aiTokensMonthly: 100_000_000,
      documentLimit: 1_000_000,
      storageLimitMb: 1_000_000,
    },
    create: {
      workspaceId: workspace.id,
      plan: "enterprise",
      status: "active",
      cancelAtPeriodEnd: false,
      seats: 999,
      aiTokensMonthly: 100_000_000,
      documentLimit: 1_000_000,
      storageLimitMb: 1_000_000,
    },
  });

  await prisma.workspaceActivity.create({
    data: {
      workspaceId: workspace.id,
      userId: workspace.ownerId,
      action: "workspace_comped",
      metadata: { plan: "enterprise", reason: "Owner-comped: VCG Foundation, free enterprise access for life" },
    },
  });

  console.log("\nDone. New billing row:");
  console.log(JSON.stringify(updated, null, 2));
  console.log(
    "\nThis is a comped/internal account: no Stripe subscription is attached, so it is never billed and never expires."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
