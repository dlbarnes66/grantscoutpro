import { prisma } from "@/lib/prisma";

export async function loadDocuments(grantId: string) {
  const docs = await prisma.grantDocument.findMany({
    where: { grantId },
    orderBy: { createdAt: "desc" },
  });

  return docs;
}
