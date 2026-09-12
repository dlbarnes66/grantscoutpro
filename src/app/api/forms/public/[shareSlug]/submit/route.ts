import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { shareSlug: string };

const SUBMISSIONS_PER_HOUR_PER_FORM = 60;
const SUBMISSIONS_PER_HOUR_PER_IP = 20;

// POST { data: Record<fieldId, value> } -> public, unauthenticated
// submission. Rate-limited by both the form and the caller's IP, since
// there's no auth here to fall back on for abuse control.
export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<Params> }
) {
  const params = await paramsPromise;

  try {
    const form = await prisma.workspaceForm.findUnique({
      where: { shareSlug: params.shareSlug },
    });

    if (!form || form.status !== "published") {
      return NextResponse.json({ error: "This form isn't accepting responses right now." }, { status: 404 });
    }

    const formLimit = await checkRateLimit(`form-submit:${form.id}`, SUBMISSIONS_PER_HOUR_PER_FORM, 60 * 60);
    if (!formLimit.allowed) {
      return NextResponse.json({ error: "This form has received a lot of submissions recently. Please try again later." }, { status: 429 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipLimit = await checkRateLimit(`form-submit-ip:${ip}`, SUBMISSIONS_PER_HOUR_PER_IP, 60 * 60);
    if (!ipLimit.allowed) {
      return NextResponse.json({ error: "Too many submissions from this connection. Please try again later." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const data = body?.data && typeof body.data === "object" ? body.data : {};

    const fields = Array.isArray(form.fields) ? (form.fields as any[]) : [];
    for (const field of fields) {
      if (field?.required) {
        const value = data[field.id];
        const isEmpty = value === undefined || value === null || value === "";
        if (isEmpty) {
          return NextResponse.json({ error: `"${field.label}" is required.` }, { status: 400 });
        }
      }
    }

    const emailField = fields.find((f) => f?.type === "email");
    const respondentEmail =
      emailField && typeof data[emailField.id] === "string" ? data[emailField.id].trim().slice(0, 320) : null;

    // Keep only known field ids, and cap value length so one huge paste
    // can't bloat a response row.
    const knownIds = new Set(fields.map((f) => f.id));
    const cleanData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (!knownIds.has(key)) continue;
      cleanData[key] = typeof value === "string" ? value.slice(0, 5000) : value;
    }

    await prisma.workspaceFormResponse.create({
      data: {
        formId: form.id,
        workspaceId: form.workspaceId,
        data: cleanData,
        respondentEmail,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUBLIC FORM SUBMIT ERROR:", err);
    return NextResponse.json({ error: "Something went wrong submitting this form." }, { status: 500 });
  }
}
