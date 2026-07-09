import { semanticSearch } from "./semantic-search";
import { generateCompletion } from "./llm";

export async function ragChat({
  workspaceId,
  message,
  history,
}: {
  workspaceId: string;
  message: string;
  history: any[];
}) {
  const searchResults = await semanticSearch({
    workspaceId,
    query: message,
  });

  const context = searchResults.results
    .map((r: any) => `${r.documentTitle}: ${r.snippet}`)
    .join("\n\n");

  const prompt = `
You are an AI assistant helping with grant research and writing.

User message:
${message}

Relevant workspace documents:
${context}

Conversation history:
${history.map((h) => `${h.role}: ${h.content}`).join("\n")}

Respond clearly and helpfully.
`;

  const completion = await generateCompletion(prompt);

  return completion;
}
