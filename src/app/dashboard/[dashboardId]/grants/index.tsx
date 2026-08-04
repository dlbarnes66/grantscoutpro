import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GrantsPage() {
  const { userId } = auth();

  if (!userId) {
    return (
      <div className="text-center py-20 text-slate-300">
        <p>You must be logged in to view grants.</p>
      </div>
    );
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: userId },
  });

  if (!workspace) {
    return (
      <div className="text-center py-20 text-slate-300">
        <p>No workspace found.</p>
      </div>
    );
  }

  const grants = await prisma.grant.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Grants</h1>
          <p className="text-slate-400 text-sm">
            Workspace: {workspace.name ?? "Workspace"}
          </p>
        </div>

        <Link
          href={`/dashboard/${params.workspaceId}/grant/new`}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Create Grant
        </Link>
      </div>

      {/* GRANT LIST */}
      {grants.length === 0 ? (
        <div className="rounded border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
          No grants yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {grants.map((grant) => (
            <Link
              key={grant.id}
              href={`/dashboard/${params.workspaceId}/grant/${grant.id}`}
              className="block rounded border border-slate-800 bg-slate-900/40 px-4 py-3 hover:bg-slate-800 transition"
            >
              <div className="text-slate-100 font-medium">{grant.title}</div>
              <div className="text-slate-500 text-xs">
                Created: {new Date(grant.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
