import { prisma } from "@/lib/prisma";

export async function loadProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  return user;
}
