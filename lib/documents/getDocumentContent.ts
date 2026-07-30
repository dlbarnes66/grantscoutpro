import { prisma } from "@/lib/prisma";

export async function getDocumentContent(workspaceId: string, documentId: string) {
  const doc = await prisma.document.findFirst({
    where: {
      id: documentId,
      workspaceId,
    },
  });

  if (!doc) {
    throw new Error("Document not found");
  }

  // Document.content is Json | null in your Prisma schema
  // We normalize it to a string for AI tools
  const content =
    typeof doc.content === "string"
      ? doc.content
      : JSON.stringify(doc.content ?? "");

  return content;
}
