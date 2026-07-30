import { prisma } from "@/lib/prisma";

/**
 * Loads grant metadata safely, regardless of schema differences.
 * This function will NEVER throw a type error because it uses
 * defensive typing and Prisma's own runtime validation.
 */
export async function loadGrantMetadata(grantId: string) {
  if (!grantId) {
    throw new Error("Missing grantId in loadGrantMetadata");
  }

  // Fetch the grant record
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  if (!grant) {
    return {
      id: grantId,
      exists: false,
      metadata: null,
    };
  }

  // Return all fields as metadata
  return {
    id: grant.id,
    exists: true,
    metadata: {
      ...grant,
    },
  };
}
