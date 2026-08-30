import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PipelineStage = {
  id: string;
  name: string;
  order: number;
};

const pipelineStages: PipelineStage[] = [
  { id: "discovery", name: "Discovery", order: 1 },
  { id: "qualification", name: "Qualification", order: 2 },
  { id: "proposal", name: "Proposal", order: 3 },
  { id: "decision", name: "Decision", order: 4 }
];

export async function GET() {
  return NextResponse.json({ stages: pipelineStages });
}
