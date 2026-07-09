import { prisma } from "@/lib/prisma";
import { embedText } from "./document-embedder";
import { cosineSimilarity } from "./similarity";

export async function semanticSearch({
  workspaceId,
  query,
}: {
  workspaceId: string;
  query: string;
}) {
  const queryEmbedding = await embedText(query);

  const docs = await prisma.documentEmbedding.findMany({
    where: { workspaceId },
    include: {
      document: true,
    },
  });

  const ranked = docs
    .map((d) => ({
      documentId: d.documentId,
      documentTitle: d.document.title,
      snippet: d.text.slice(0, 200),
      score: cosineSimilarity(queryEmbedding, d.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return { results: ranked };
}
