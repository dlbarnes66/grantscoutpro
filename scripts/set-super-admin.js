// scripts/set-super-admin.js
//
// One-time admin utility: marks the platform owner's account as a
// super admin (User.superAdmin = true) -- the flag src/lib/security/
// super-admin.ts checks to gate the /api/superadmin/* routes (revenue
// dashboard, platform analytics, AI usage across all workspaces).
//
// This is a platform-wide role, separate from a workspace's billing
// plan (see scripts/comp-workspace-enterprise.js for that). It does
// NOT touch Stripe, workspaces, or billing.
//
// This script also reports any OTHER accounts that currently have
// superAdmin = true, without touching them -- so you can see and
// decide for yourself whether to revoke them, rather than having
// this silently change someone else's access.
//
// Run this yourself, on your own machine, since it talks directly to
// the production database:
//
//   node scripts/set-super-admin.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OWNER_EMAIL = "dlbarnes@vcgnow.com";

async function main() {
  const owner = await prisma.user.findFirst({
    where: { email: { equals: OWNER_EMAIL, mode: "insensitive" } },
  });

  if (!owner) {
    console.error(`No user found with email ${OWNER_EMAIL}.`);
    process.exit(1);
  }

  if (owner.superAdmin) {
    console.log(`${OWNER_EMAIL} (id: ${owner.id}) is already a super admin. No change needed.`);
  } else {
    await prisma.user.update({
      where: { id: owner.id },
      data: { superAdmin: true },
    });
    console.log(`${OWNER_EMAIL} (id: ${owner.id}) is now a super admin.`);
  }

  const others = await prisma.user.findMany({
    where: { superAdmin: true, id: { not: owner.id } },
    select: { id: true, email: true, name: true },
  });

  if (others.length === 0) {
    console.log("\nNo other accounts currently have superAdmin = true -- you are the only super admin.");
  } else {
    console.log(
      `\nHeads up: ${others.length} other account(s) also currently have superAdmin = true. This script did NOT change them -- review and revoke manually if that's not intended:\n`
    );
    for (const u of others) {
      console.log(`  ${u.id}  ${u.email ?? "(no email)"}  ${u.name ?? ""}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
