import { semanticSearch } from "./semantic-search";
import { generateCompletion } from "./llm";

/**
 * RAG chat handler.
 */
export async function ragChat({
  workspaceId,
  message,
  history
}: {
  workspaceId: string;
  message: string;
  history: any[];
}) {
  // FIXED — semanticSearch expects (workspaceId, query)
  const searchResults = await semanticSearch(workspaceId, message);

  const context = searchResults
    .slice(0, 5)
    .map((r) => `Document ${r.id}:\n${r.text}`)
    .join("\n\n");

  const prompt = `
You are an AI assistant answering a user's chat message using workspace documents.

Message:
${message}

Relevant Context:
${context}

Chat History:
${JSON.stringify(history, null, 2)}

Respond clearly and helpfully:
`;

  const answer = await generateCompletion(prompt);

  return {
    answer,
    sources: searchResults.slice(0, 5)
  };
}
