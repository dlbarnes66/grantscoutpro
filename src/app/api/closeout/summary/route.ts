import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SummaryInput = {
  financials: { category: string; budgeted: number; actual: number }[];
  assets: { id: string; name: string; value: number; status: string }[];
  checklist: { id: string; label: string; done: boolean }[];
};

export async function POST(req: NextRequest) {
  const body: SummaryInput = await req.json().catch(() => ({
    financials: [],
    assets: [],
    checklist: []
  }));

  const overspent = body.financials.filter((f) => f.actual > f.budgeted);
  const incomplete = body.checklist.filter((c) => !c.done);

  const summary = `
The project demonstrated strong operational performance and maintained compliance across most required areas.

Financial Review:
${overspent.length === 0
    ? "- All categories remained within budget."
    : overspent.map((f) => `- Overspending detected in ${f.category}.`).join("\n")}

Checklist Review:
${incomplete.length === 0
    ? "- All closeout tasks completed."
    : incomplete.map((c) => `- Pending: ${c.label}`).join("\n")}

Asset Review:
${body.assets.map((a) => `- ${a.name}: ${a.status}`).join("\n")}
`;

  return NextResponse.json({ summary });
}
