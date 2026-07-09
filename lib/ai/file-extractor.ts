import { prisma } from "@/lib/prisma";

export async function extractFileContent(fileId: string): Promise<string> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) return "";

  return file.text || "";
}
