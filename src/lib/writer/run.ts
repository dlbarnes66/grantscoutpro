"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId, requireWorkspaceMember, requireWorkspaceDocument } from "./validate";
import { logWriterUsage } from "./log";
import { getPromptForTool, WriterTool } from "./prompts";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface RunWriterInput {
  workspaceId: string;
  documentId: string;
  tool: WriterTool;
  prompt: string;
}

export async function runWriter(input: RunWriterInput): Promise<string> {
  const { workspaceId, documentId, tool, prompt } = input;

  const userId = await requireUserId();
  await requireWorkspaceMember(workspaceId, userId);

  const document = await requireWorkspaceDocument(workspaceId, documentId);

  const systemPrompt = getPromptForTool(tool);

  const finalPrompt = `
SYSTEM INSTRUCTIONS:
${systemPrompt}

USER INPUT:
${prompt}

DOCUMENT CONTENT:
${document.content}
  `.trim();

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: finalPrompt }
    ],
    temperature: 0.7
  });

  const output: string =
    aiResponse.choices[0].message.content ?? "";

  await logWriterUsage({
    workspaceId,
    userId,
    tool,
    documentId,
    prompt,
    output
  });

  return output;
}
