import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GrantSource } from "@prisma/client";
import { assertGrantWorkspaceAccess } from "@/lib/ai/negotiation";
import { draftApplicationAnswers, type ApplicationQuestion } from "@/lib/ai/applicationAssistant";
import { extractTextFromFile, UnsupportedFileTypeError } from "@/lib/documents/extractText";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string; grantId: string };

// Private/foundation funders only - see applicationAssistant.ts's header
// comment for why federal/state applications don't fit this flow.
const ELIGIBLE_SOURCES: GrantSource[] = [GrantSource.FOUNDATION, GrantSource.PHILANTHROPIC];
const INELIGIBLE_MESSAGE =
  "This assistant is for private and foundation funder applications, which are usually free-text Q&A. Federal and state grants use a rigid structured form (SF-424 + attachments) instead - use \"Build Submission Package with AI\" for those.";

async function loadGrant(workspaceId: string, grantId: string) {
  const grant = await prisma.grant.findUnique({ where: { id: grantId } });
  if (!grant || grant.workspaceId !== workspaceId) return null;
  return grant;
}

// GET: tells the UI whether this grant is even eligible for the
// assistant, and returns the most recent draft/ready record if one
// exists, without running any AI or consuming anything.
export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const grant = await loadGrant(params.id, params.grantId);
  if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

  const eligible = ELIGIBLE_SOURCES.includes(grant.source);
  if (!eligible) {
    return NextResponse.json({ eligible: false, reason: INELIGIBLE_MESSAGE, assistant: null });
  }

  const assistant = await prisma.applicationAssistant.findFirst({
    where: { workspaceId: params.id, grantId: params.grantId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ eligible: true, reason: null, assistant });
}

// POST: draft answers from either pasted text (application/json body,
// { questionsText }) or an uploaded file (multipart/form-data, field
// "file") - exactly one input mode per call. Overwrites this grant's
// existing assistant record (one per grant per workspace), same
// "re-running replaces the draft" behavior as .../package/generate.
export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const grant = await loadGrant(params.id, params.grantId);
  if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

  if (!ELIGIBLE_SOURCES.includes(grant.source)) {
    return NextResponse.json({ error: INELIGIBLE_MESSAGE }, { status: 403 });
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: params.id }, select: { ownerId: true } });
  const profile = workspace ? await prisma.userProfile.findUnique({ where: { userId: workspace.ownerId } }) : null;

  if (!profile) {
    return NextResponse.json(
      { error: "This workspace doesn't have an organization profile yet - complete onboarding first." },
      { status: 400 }
    );
  }

  const contentType = req.headers.get("content-type") || "";
  let rawText = "";
  let sourceType: "pasted" | "uploaded";
  let sourceFileName: string | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "Missing file" }, { status: 400 });
      }
      rawText = await extractTextFromFile(file);
      sourceType = "uploaded";
      sourceFileName = file.name;
    } else {
      const body = await req.json().catch(() => null);
      const questionsText = typeof body?.questionsText === "string" ? body.questionsText.trim() : "";
      if (!questionsText) {
        return NextResponse.json({ error: "Paste the funder's application questions, or upload their application file." }, { status: 400 });
      }
      rawText = questionsText;
      sourceType = "pasted";
    }
  } catch (err: any) {
    if (err instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("APPLICATION ASSISTANT INPUT ERROR:", err);
    return NextResponse.json({ error: err?.message || "Couldn't read that input." }, { status: 400 });
  }

  const { questions, tokensUsed } = await draftApplicationAnswers(rawText, profile, grant);

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "Couldn't find any answerable questions in that text - try pasting more of the application, including the actual questions." },
      { status: 400 }
    );
  }

  const existing = await prisma.applicationAssistant.findFirst({
    where: { workspaceId: params.id, grantId: params.grantId },
  });

  const assistant = existing
    ? await prisma.applicationAssistant.update({
        where: { id: existing.id },
        data: { questions: questions as any, status: "draft", sourceType, sourceFileName },
      })
    : await prisma.applicationAssistant.create({
        data: {
          workspaceId: params.id,
          grantId: params.grantId,
          userId,
          questions: questions as any,
          status: "draft",
          sourceType,
          sourceFileName,
        },
      });

  console.log(`Application assistant drafted ${questions.length} answers (${tokensUsed} tokens) for grant ${params.grantId}`);

  return NextResponse.json({ assistant });
}

// PATCH: save edits to the drafted answers, and/or move status
// draft -> ready (a label only - this app never submits to the
// funder's site, same boundary as .../package/finalize).
export async function PATCH(req: NextRequest, context: { params: Promise<Params> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await context.params;
  const hasAccess = await assertGrantWorkspaceAccess(params.id, params.grantId, userId);
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.applicationAssistant.findFirst({
    where: { workspaceId: params.id, grantId: params.grantId },
  });
  if (!existing) return NextResponse.json({ error: "Nothing to update yet - draft answers first." }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data: { questions?: any; status?: string } = {};

  if ("questions" in body) {
    if (!Array.isArray(body.questions)) {
      return NextResponse.json({ error: "questions must be an array" }, { status: 400 });
    }
    data.questions = body.questions.map((q: any, index: number) => ({
      id: typeof q?.id === "string" ? q.id : `q${index + 1}`,
      prompt: typeof q?.prompt === "string" ? q.prompt : "",
      wordLimit: typeof q?.wordLimit === "number" ? q.wordLimit : null,
      answer: typeof q?.answer === "string" ? q.answer : "",
    }));
  }

  if ("status" in body) {
    if (body.status !== "draft" && body.status !== "ready") {
      return NextResponse.json({ error: "status must be \"draft\" or \"ready\"" }, { status: 400 });
    }
    data.status = body.status;
  }

  const assistant = await prisma.applicationAssistant.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({ assistant });
}
