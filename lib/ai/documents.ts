import { prisma } from "@/lib/prisma";

export async function getDocumentContent(
  workspaceId: string,
  documentId: string
): Promise<string> {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, workspaceId },
  });

  if (!doc) throw new Error("Document not found");

  const raw = doc.content;

  if (typeof raw === "string") return raw;
  return JSON.stringify(raw ?? "");
}
