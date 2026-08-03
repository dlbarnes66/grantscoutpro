import { generateCompletion } from "@/lib/ai/llm";
import { getDocumentContent } from "@/lib/documents/getDocumentContent";

export async function runDocumentTool({
  workspaceId,
  documentId,
  tool,
}: {
  workspaceId: string;
  documentId: string;
  tool: "summarize" | "explain" | "rewrite" | "requirements";
}) {
  const content = await getDocumentContent(workspaceId, documentId);

  const prompts: Record<typeof tool, string> = {
    summarize: `Summarize the following document:\n\n${content}`,
    explain: `Explain the following document in simple terms:\n\n${content}`,
    rewrite: `Rewrite the following document to be clearer and more professional:\n\n${content}`,
    requirements: `Extract all grant requirements from the following document:\n\n${content}`,
  };

  const prompt = prompts[tool];

  const completion = await generateCompletion(prompt);

  return completion;
}
