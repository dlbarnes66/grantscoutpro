import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "next-auth";
import { generateGrantEnhancement } from "./actions";

export default async function EnhancementPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return <div className="text-slate-300 text-sm">Not authenticated.</div>;
  }

  const workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId } } },
  });

  if (!workspace) {
    return <div className="text-slate-300 text-sm">Workspace not found.</div>;
  }

  const grants = await prisma.grant.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const history = await prisma.grantEnhancementHistory.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-100">
          AI Grant Enhancement Engine
        </div>
        <div className="text-sm text-slate-400">
          Enhance narratives, structure, persuasion, compliance, evidence, and strategy.
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs">
        <form
          action={async (formData) => {
            "use server";
            const grantId = formData.get("grantId")?.toString() ?? "";
            await generateGrantEnhancement(grantId, workspace.id, userId);
          }}
          className="space-y-3"
        >
          <select
            name="grantId"
            className="w-full rounded bg-slate-800 text-slate-200 p-2"
          >
            {grants.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded border border-pink-500/60 px-3 py-2 text-pink-200 hover:bg-pink-500/20"
          >
            Generate Enhancement Analysis
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs">
        <div className="text-sm font-semibold text-slate-100 mb-2">
          Enhancement History
        </div>

        {history.length === 0 ? (
          <div className="text-xs text-slate-400">No enhancement history yet.</div>
        ) : (
          <div className="space-y-4">
            {history.map((h) => (
              <div
                key={h.id}
                className="rounded border border-slate-800 bg-slate-900/60 p-3"
              >
                <div className="text-slate-200 font-medium">
                  {new Date(h.createdAt).toLocaleString()}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-blue-300">Narrative: {h.narrativeEnhancement}</div>
                  <div className="text-green-300">Structural: {h.structuralEnhancement}</div>
                  <div className="text-yellow-300">Persuasive: {h.persuasiveEnhancement}</div>
                  <div className="text-purple-300">Compliance: {h.complianceEnhancement}</div>
                  <div className="text-pink-300">Evidence: {h.evidenceEnhancement}</div>
                  <div className="text-orange-300">Strategic: {h.strategicEnhancement}</div>
                  <div className="text-red-300">Overall: {h.overall}</div>
                </div>

                <pre className="mt-2 text-[10px] text-blue-300">{h.analysis}</pre>
                <pre className="mt-2 text-[10px] text-green-300">Narrative: {h.narrativeFactors}</pre>
                <pre className="mt-2 text-[10px] text-yellow-300">Structural: {h.structuralFactors}</pre>
                <pre className="mt-2 text-[10px] text-purple-300">Persuasive: {h.persuasiveFactors}</pre>
                <pre className="mt-2 text-[10px] text-pink-300">Compliance: {h.complianceFactors}</pre>
                <pre className="mt-2 text-[10px] text-orange-300">Evidence: {h.evidenceFactors}</pre>
                <pre className="mt-2 text-[10px] text-indigo-300">Strategic: {h.strategicFactors}</pre>
                <pre className="mt-2 text-[10px] text-red-200">Strategy: {h.strategy}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
