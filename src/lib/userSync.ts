import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SyncUserInput = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

/**
 * Create or update the User row for a Clerk identity, keyed by Clerk's user
 * id (we use Clerk's id as our own User.id - see ensureUser()).
 *
 * Dev and Production Clerk instances have completely separate user pools,
 * so the first time someone signs in once an app moves to a Production
 * Clerk instance (e.g. after a custom-domain/SSL cutover), they get a
 * brand-new Clerk user id - even though it's the same person with the same
 * email as a leftover User row from testing against the old Dev instance.
 * A plain `upsert({ where: { id } })` doesn't see that old row (different
 * id), falls through to `create`, and Postgres rejects the insert because
 * User.email is unique - surfacing as a raw
 * "Unique constraint failed on the fields: (`email`)" error.
 *
 * When that happens, we re-point the existing row at the new Clerk id
 * instead of leaving a duplicate/orphaned row behind. Every foreign key
 * into User.id is ON UPDATE CASCADE (confirmed in the Prisma migrations),
 * so this safely carries over that user's workspaces, saved searches,
 * drafts, etc. to the new id.
 */
export async function syncUserFromClerk({ id, email, name, image }: SyncUserInput) {
  try {
    return await prisma.user.upsert({
      where: { id },
      update: {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
        ...(image ? { image } : {}),
      },
      create: { id, email, name, image },
    });
  } catch (err) {
    const isEmailConflict =
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002" &&
      (err.meta?.target as string[] | undefined)?.includes("email");

    if (!isEmailConflict || !email) {
      throw err;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing || existing.id === id) {
      // Not actually a recoverable email collision (e.g. a genuine race) -
      // surface the original error rather than masking it.
      throw err;
    }

    return prisma.user.update({
      where: { id: existing.id },
      data: {
        id,
        ...(name ? { name } : {}),
        ...(image ? { image } : {}),
      },
    });
  }
}
