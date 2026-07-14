import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function testPortfolioOptimization() {
  const user = await prisma.user.findFirst();
  const grant = await prisma.grant.findFirst();

  const opt = await prisma.portfolioOptimization.create({
    data: {
      userId: user!.id,
      grantId: grant!.id,
      details: { score: 0.92 },
    },
  });

  console.log("PortfolioOptimization OK:", opt);
}

testPortfolioOptimization();
