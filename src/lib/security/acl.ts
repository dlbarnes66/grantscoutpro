import { prisma } from "@/lib/prisma";

export async function canViewDocument(userId: string, documentId: string) {
  const access = await prisma.documentAccess.findUnique({
    where: {
      documentId_userId: {
        documentId,
        userId,
      },
    },
  });

  return access?.canView ?? false;
}

export async function canEditDocument(userId: string, documentId: string) {
  const access = await prisma.documentAccess.findUnique({
    where: {
      documentId_userId: {
        documentId,
        userId,
      },
    },
  });

  return access?.canEdit ?? false;
}

export async function canRunDocumentAI(userId: string, documentId: string) {
  const access = await prisma.documentAccess.findUnique({
    where: {
      documentId_userId: {
        documentId,
        userId,
      },
    },
  });

  return access?.canRunAI ?? false;
}

/**
 * Legacy compatibility wrapper
 * Some older routes still import `canRunAI`
 */
export async function canRunAI(userId: string, documentId: string) {
  return canRunDocumentAI(userId, documentId);
}
