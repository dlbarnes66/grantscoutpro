import { generateCompletion } from "./llm";
import { getDocumentContent } from "./documents";

export type DocumentTool =
  | "summarize"
  | "explain"
  | "rewrite"
  | "requirements";

export async function runDocumentTool({
  workspaceId,
  documentId,
  tool,
}: {
  workspaceId: string;
  documentId: string;
  tool: DocumentTool;
}): Promise<string> {
  const content = await getDocumentContent(workspaceId, documentId);

  const prompts: Record<DocumentTool, string> = {
    summarize: `Summarize the following document:\n\n${content}`,
    explain: `Explain the following document in simple terms:\n\n${content}`,
    rewrite: `Rewrite the following document to be clearer and more professional:\n\n${content}`,
    requirements: `Extract all grant requirements from the following document:\n\n${content}`,
  };

  const prompt = prompts[tool];
  return generateCompletion(prompt);
}
