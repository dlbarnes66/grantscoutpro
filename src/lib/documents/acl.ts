// src/lib/documents/acl.ts
import { prisma } from "@/lib/prisma";

export async function getWorkspaceDocumentWithAcl(
  workspaceId: string,
  documentId: string,
  userId: string
) {
  const doc = await prisma.workspaceDocument.findUnique({
    where: { id: documentId },
    include: {
      workspace: { include: { members: true } },
    },
  });

  if (!doc || doc.workspaceId !== workspaceId) return null;

  const workspace = doc.workspace;
  const isMember =
    workspace.ownerId === userId ||
    workspace.members.some((m) => m.userId === userId);

  if (!isMember) return null;

  return doc;
}
