import { prisma } from "@/lib/prisma";

export async function isSuperAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { superAdmin: true },
  });

  return user?.superAdmin === true;
}
