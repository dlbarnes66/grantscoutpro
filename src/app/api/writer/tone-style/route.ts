"use server";

import { NextResponse } from "next/server";
import { runWriter } from "@/lib/writer/run";
import type { WriterTool } from "@/lib/writer/prompts";

interface WriterRequest {
  workspaceId: string;
  documentId: string;
  prompt: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { workspaceId, documentId, prompt }: WriterRequest = await req.json();

    const output = await runWriter({
      workspaceId,
      documentId,
      tool: "tone-style" as WriterTool,
      prompt
    });

    return NextResponse.json({ output });
  } catch (err: any) {
    console.error("Tone Style Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
