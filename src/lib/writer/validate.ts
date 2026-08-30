"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function requireUserId(): Promise<string> {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized: user not logged in.");
  }
  return user.id;
}

export async function requireWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<void> {
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId }
  });

  if (!member) {
    throw new Error("Forbidden: user is not a member of this workspace.");
  }
}

export async function requireWorkspaceDocument(
  workspaceId: string,
  documentId: string
): Promise<{ id: string; content: string }> {
  const doc = await prisma.workspaceDocument.findFirst({
    where: { id: documentId, workspaceId }
  });

  if (!doc) {
    throw new Error("Document not found in this workspace.");
  }

  return {
    id: doc.id,
    content: doc.content ?? ""
  };
}
