import React from "react";
import { prisma } from "@/lib/prisma.ts";
import { useWorkspace } from "../_context/WorkspaceContext";

export default async function ActivityPage() {
  const workspace = useWorkspace();

  const activities = await prisma.workspaceActivity.findMany({
    where: { workspaceId: workspace.workspaceId ?? "" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-slate-100">
        Workspace Activity
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        {activities.length === 0 ? (
          <div className="text-xs text-slate-400">
            No activity recorded yet.
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {activities.map((a) => (
              <div
                key={a.id}
                className="rounded border border-slate-800/60 bg-slate-900/60 px-3 py-2"
              >
                <div className="text-slate-200 font-medium">{a.action}</div>
                <div className="text-slate-400">
                  {new Date(a.createdAt).toLocaleString()}
                </div>
                {a.metadata && (
                  <pre className="mt-1 text-[10px] text-slate-500">
                    {JSON.stringify(a.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
