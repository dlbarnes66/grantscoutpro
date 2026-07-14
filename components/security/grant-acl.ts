export async function requireGrantAI(userId: string, grantId: string) {
  const access = await prisma.grantAccess.findUnique({
    where: {
      grantId_userId: {
        grantId,
        userId,
      },
    },
  });

  return access?.canRunAI ?? false;
}
