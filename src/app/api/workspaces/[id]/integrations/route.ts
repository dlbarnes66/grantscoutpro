import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/ai/activity-log";
import { PROVIDERS, getProvider } from "@/lib/integrations/providers";
import { encryptJson, decryptJson, maskSecret } from "@/lib/integrations/secretBox";
import { validateProvider } from "@/lib/integrations/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

// Activity logging should never fail the actual action it's attached to.
function logActivitySafe(workspaceId: string, action: string, metadata: any, userId?: string) {
  return logActivity(workspaceId, action, metadata, userId).catch((err) => {
    console.error(`Failed to log workspace activity "${action}":`, err);
  });
}

async function loadWorkspaceAndRole(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true },
  });

  if (!workspace) return { workspace: null, me: null };

  const me =
    workspace.ownerId === userId
      ? { role: "owner" as const }
      : workspace.members.find((m) => m.userId === userId);

  return { workspace, me };
}

// Bring-your-own-API-key integrations are workspace-wide credentials,
// same sensitivity class as adding/removing members - so only the
// workspace owner or an admin can view, save, or remove them.
async function requireAdminAccess(workspaceId: string, userId: string) {
  const { workspace, me } = await loadWorkspaceAndRole(workspaceId, userId);
  if (!workspace) return { workspace: null, allowed: false as const };
  const allowed = !!me && (me.role === "owner" || me.role === "admin");
  return { workspace, allowed };
}

// GET: the full catalog merged with this workspace's saved connections.
// Never returns a decrypted secret - only a masked hint (e.g. "••••abcd").
export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, allowed } = await requireAdminAccess(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const saved = await prisma.workspaceIntegration.findMany({
      where: { workspaceId: params.id },
    });
    const savedByProvider = new Map(saved.map((row) => [row.provider, row]));

    const providers = PROVIDERS.map((provider) => {
      const row = savedByProvider.get(provider.id);
      let maskedValues: Record<string, string> | null = null;

      if (row) {
        try {
          const values = decryptJson<Record<string, string>>(row.encryptedData);
          maskedValues = {};
          for (const field of provider.fields) {
            const value = values[field.key] || "";
            maskedValues[field.key] = field.secret ? maskSecret(value) : value;
          }
        } catch (err) {
          console.error(`Failed to decrypt integration "${provider.id}" for workspace ${params.id}:`, err);
        }
      }

      return {
        id: provider.id,
        name: provider.name,
        category: provider.category,
        authType: provider.authType,
        hasLiveValidation: provider.hasLiveValidation,
        fields: provider.fields.map(({ key, label, placeholder, secret, type, options }) => ({
          key,
          label,
          placeholder,
          secret: !!secret,
          type: type || "text",
          options,
        })),
        docsUrl: provider.docsUrl,
        helpText: provider.helpText,
        connection: row
          ? {
              status: row.status,
              lastCheckedAt: row.lastCheckedAt,
              lastError: row.lastError,
              maskedValues,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, providers });
  } catch (err: any) {
    console.error("WORKSPACE INTEGRATIONS GET ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST { provider, values } -> save (and, where possible, live-verify)
// this workspace's own credentials for one provider.
export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, allowed } = await requireAdminAccess(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => null);
    const providerId = typeof body?.provider === "string" ? body.provider : "";
    const values = body?.values && typeof body.values === "object" ? body.values : {};

    const provider = getProvider(providerId);
    if (!provider) {
      return NextResponse.json({ error: "Unknown integration" }, { status: 400 });
    }
    if (provider.authType !== "api_key") {
      return NextResponse.json(
        { error: `${provider.name} requires an OAuth connection, which isn't available yet.` },
        { status: 400 }
      );
    }

    const cleanValues: Record<string, string> = {};
    for (const field of provider.fields) {
      const raw = values[field.key];
      const trimmed = typeof raw === "string" ? raw.trim() : "";
      if (!trimmed) {
        return NextResponse.json({ error: `${field.label} is required.` }, { status: 400 });
      }
      cleanValues[field.key] = trimmed;
    }

    let status = "saved";
    let lastError: string | null = null;

    if (provider.hasLiveValidation) {
      const result = await validateProvider(provider.id, cleanValues);
      if (result) {
        status = result.ok ? "connected" : "invalid";
        lastError = result.ok ? null : result.message || "Verification failed.";
      }
    }

    const encryptedData = encryptJson(cleanValues);

    const saved = await prisma.workspaceIntegration.upsert({
      where: { workspaceId_provider: { workspaceId: params.id, provider: provider.id } },
      update: {
        encryptedData,
        status,
        lastError,
        lastCheckedAt: provider.hasLiveValidation ? new Date() : null,
        connectedById: userId,
      },
      create: {
        workspaceId: params.id,
        provider: provider.id,
        category: provider.category,
        encryptedData,
        status,
        lastError,
        lastCheckedAt: provider.hasLiveValidation ? new Date() : null,
        connectedById: userId,
      },
    });

    await logActivitySafe(
      params.id,
      status === "invalid" ? "integration_save_failed" : "integration_saved",
      { provider: provider.id, providerName: provider.name, status },
      userId
    );

    const maskedValues: Record<string, string> = {};
    for (const field of provider.fields) {
      maskedValues[field.key] = field.secret ? maskSecret(cleanValues[field.key]) : cleanValues[field.key];
    }

    return NextResponse.json({
      success: true,
      connection: {
        status: saved.status,
        lastCheckedAt: saved.lastCheckedAt,
        lastError: saved.lastError,
        maskedValues,
      },
    });
  } catch (err: any) {
    console.error("WORKSPACE INTEGRATIONS POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE { provider } -> disconnect / remove this workspace's saved
// credentials for one provider.
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const params = await context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace, allowed } = await requireAdminAccess(params.id, userId);
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => null);
    const providerId = typeof body?.provider === "string" ? body.provider : "";
    const provider = getProvider(providerId);
    if (!provider) {
      return NextResponse.json({ error: "Unknown integration" }, { status: 400 });
    }

    await prisma.workspaceIntegration
      .delete({
        where: { workspaceId_provider: { workspaceId: params.id, provider: provider.id } },
      })
      .catch(() => null); // already disconnected - not an error

    await logActivitySafe(
      params.id,
      "integration_removed",
      { provider: provider.id, providerName: provider.name },
      userId
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WORKSPACE INTEGRATIONS DELETE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
