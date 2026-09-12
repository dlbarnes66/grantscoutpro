import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardAIRequest } from "@/lib/ai/guardAIRequest";
import { callUnifiedModel } from "@/app/api/ai/autoeditor/_lib/unifiedModel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

const ALLOWED_FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "date",
  "select",
  "checkbox",
] as const;

function extractJson(raw: string): any {
  // The model sometimes wraps JSON in a ```json ... ``` fence despite the
  // prompt asking it not to - strip that before parsing.
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : raw;
  return JSON.parse(candidate);
}

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;
  const { userId } = await auth();

  const guardResponse = await guardAIRequest(params.id, userId);
  if (guardResponse) return guardResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const grantId = typeof body?.grantId === "string" ? body.grantId : undefined;

    if (!description) {
      return NextResponse.json({ error: "description is required." }, { status: 400 });
    }

    let grantContext = "";
    if (grantId) {
      const grant = await prisma.grant.findFirst({
        where: { id: grantId, workspaceId: params.id },
        select: { title: true, agency: true, summary: true, eligibleApplicants: true, eligibility: true },
      });
      if (grant) {
        grantContext = `
This form is for applying to a specific grant. Tailor the fields to what this grant likely requires:
Grant title: ${grant.title}
Agency/funder: ${grant.agency || "unknown"}
Summary: ${grant.summary || "none provided"}
Eligible applicants: ${grant.eligibleApplicants || "not specified"}
`;
      }
    }

    const prompt = `
You design intake/application forms for a nonprofit grant-management platform. Given a plain-language description, produce a form as STRICT JSON only - no prose, no markdown code fence, just the JSON object.

Shape (exactly these keys):
{
  "title": string,
  "description": string,
  "fields": [
    {
      "id": string (short, lowercase, no spaces, e.g. "org_name"),
      "type": one of ${JSON.stringify(ALLOWED_FIELD_TYPES)},
      "label": string,
      "required": boolean,
      "helpText": string (optional, omit if not needed),
      "options": string[] (only for type "select", omit otherwise)
    }
  ]
}

Keep it to the fields that genuinely matter (typically 5-12). Every field "id" must be unique.
${grantContext}
Description of the form to build:
${description}
`;

    const raw = await callUnifiedModel(prompt);

    let draft: any;
    try {
      draft = extractJson(raw);
    } catch (parseErr) {
      console.error("FORM GENERATE - failed to parse model output:", raw);
      return NextResponse.json(
        { error: "The AI didn't return a usable form. Try rephrasing the description." },
        { status: 502 }
      );
    }

    if (!draft || typeof draft.title !== "string" || !Array.isArray(draft.fields)) {
      return NextResponse.json(
        { error: "The AI didn't return a usable form. Try rephrasing the description." },
        { status: 502 }
      );
    }

    const seenIds = new Set<string>();
    const fields = draft.fields
      .filter((f: any) => f && typeof f.label === "string" && ALLOWED_FIELD_TYPES.includes(f.type))
      .map((f: any, i: number) => {
        let id = typeof f.id === "string" && f.id.trim() ? f.id.trim() : `field_${i}`;
        while (seenIds.has(id)) id = `${id}_${i}`;
        seenIds.add(id);
        return {
          id,
          type: f.type,
          label: f.label,
          required: !!f.required,
          helpText: typeof f.helpText === "string" ? f.helpText : undefined,
          options: f.type === "select" && Array.isArray(f.options) ? f.options.filter((o: any) => typeof o === "string") : undefined,
        };
      });

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "The AI didn't return any usable fields. Try rephrasing the description." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: {
        title: draft.title,
        description: typeof draft.description === "string" ? draft.description : "",
        fields,
      },
    });
  } catch (err: any) {
    console.error("WORKSPACE FORM GENERATE ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to generate form." }, { status: 500 });
  }
}
