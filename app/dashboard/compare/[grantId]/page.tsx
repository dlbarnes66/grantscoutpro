import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RealtimeWrapper from "./RealtimeWrapper";
import {
  analyzeComparison,
  renameComparison,
  addGrantToComparison,
  removeGrantFromComparison,
  deleteComparison,
  addComment,
  deleteComment,
} from "./actions";

export default async function ComparisonDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { workspaceId?: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/");

  const workspaceId = searchParams.workspaceId;
  if (!workspaceId) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No workspace selected.</p>
      </div>
    );
  }

  // Load comparison (workspace-scoped)
  const comparison = await prisma.grantComparison.findUnique({
    where: { id: params.id, workspaceId },
    include: {
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!comparison) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Comparison not found in this workspace.
      </div>
    );
  }

  // Workspace permission check
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId },
  });

  if (!membership) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        You do not have access to this workspace.
      </div>
    );
  }

  const isOwner = membership.role === "owner";
  const isAdmin = membership.role === "admin";
  const canEdit = isOwner || isAdmin;

  // Load grants
  const grants = await prisma.federalGrant.findMany({
    where: { id: { in: comparison.grantIds } },
  });

  const analysis = comparison.analysis as any;

  return (
    <div className="p-6 space-y-10">
      {/* REALTIME LISTENER */}
      <RealtimeWrapper comparisonId={comparison.id} />

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {comparison.name || "Grant Comparison"}
        </h1>

        <div className="flex gap-3">
          {/* EXPORT TO PDF */}
          <a
            href={`/api/comparison-pdf?id=${comparison.id}&workspaceId=${workspaceId}`}
            target="_blank"
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
          >
            Export as PDF
          </a>

          {/* DELETE COMPARISON */}
          {canEdit && (
            <form
              action={async () => {
                "use server";
                await deleteComparison(comparison.id, userId);
                redirect(`/dashboard/compare?workspaceId=${workspaceId}`);
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={() => {
                  if (!confirm("Are you sure you want to delete this comparison?")) {
                    throw new Error("User cancelled deletion");
                  }
                }}
              >
                Delete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* RENAME (OWNER/ADMIN) */}
      {canEdit && (
        <form
          action={async (formData) => {
            "use server";
            const newName = formData.get("name") as string;
            await renameComparison(comparison.id, newName, userId);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            name="name"
            defaultValue={comparison.name || ""}
            className="border p-2 rounded flex-1"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Rename
          </button>
        </form>
      )}

      {/* ADD GRANT (OWNER/ADMIN) */}
      {canEdit && (
        <div className="p-4 border rounded bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Add Grant to Comparison</h2>

          <form
            action={async (formData) => {
              "use server";
              const grantId = formData.get("grantId") as string;
              await addGrantToComparison(comparison.id, grantId, userId);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              name="grantId"
              placeholder="Enter Grant ID"
              className="border p-2 rounded flex-1"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Add Grant
            </button>
          </form>
        </div>
      )}

      {/* AI ANALYSIS */}
      <div className="p-4 border rounded bg-white space-y-4 shadow-sm">
        <h2 className="text-xl font-semibold">AI Analysis</h2>

        {!analysis && canEdit && (
          <form action={async () => await analyzeComparison(comparison.id, userId)}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Run AI Comparison
            </button>
          </form>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* WINNER */}
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-700">Recommended Grant</h3>
              <p className="text-sm mt-1">
                <strong>
                  {grants.find((g) => g.id === analysis.winnerId)?.title}
                </strong>
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {analysis.winnerReason}
              </p>
            </div>

            {/* SUMMARY */}
            <div>
              <h3 className="font-semibold">Summary</h3>
              <p className="text-sm text-gray-700 mt-1">{analysis.summary}</p>
            </div>

            {/* STRENGTHS & WEAKNESSES */}
            <div className="space-y-4">
              <h3 className="font-semibold">Strengths & Weaknesses</h3>

              {analysis.grants.map((g: any) => {
                const grant = grants.find((x) => x.id === g.id);

                return (
                  <div
                    key={g.id}
                    className="p-3 border rounded bg-gray-50 shadow-sm"
                  >
                    <h4 className="font-semibold">{grant?.title}</h4>

                    <div className="mt-2">
                      <strong>Strengths:</strong>
                      <ul className="list-disc ml-6 text-sm text-gray-700">
                        {g.strengths.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-2">
                      <strong>Weaknesses:</strong>
                      <ul className="list-disc ml-6 text-sm text-gray-700">
                        {g.weaknesses.map((w: string, i: number) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SIDE-BY-SIDE GRANTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grants.map((g) => (
          <div
            key={g.id}
            className="p-4 border rounded bg-white shadow-sm hover:shadow transition"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold mb-2">{g.title}</h2>

              {canEdit && (
                <form
                  action={async () => {
                    "use server";
                    await removeGrantFromComparison(comparison.id, g.id, userId);
                  }}
                >
                  <button className="text-red-600 text-sm hover:underline">
                    Remove
                  </button>
                </form>
              )}
            </div>

            <div className="text-sm space-y-1">
              <div>
                <strong>Agency:</strong> {g.agency ?? "—"}
              </div>
              <div>
                <strong>Category:</strong> {g.category ?? "—"}
              </div>
              <div>
                <strong>Deadline:</strong>{" "}
                {g.deadline?.toISOString().split("T")[0] ?? "—"}
              </div>
              <div>
                <strong>Amount:</strong>{" "}
                {g.amount ? `$${g.amount.toLocaleString()}` : "—"}
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-700 line-clamp-4">
              {g.summary}
            </p>
          </div>
        ))}
      </div>

      {/* COMMENTS */}
      <div className="p-4 border rounded bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>

        {/* ADD COMMENT */}
        <form
          action={async (formData) => {
            "use server";
            const text = formData.get("text") as string;
            await addComment(comparison.id, text, userId);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            name="text"
            placeholder="Write a comment..."
            className="border p-2 rounded flex-1"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Post
          </button>
        </form>

        {/* COMMENT LIST */}
        <div className="space-y-3">
          {comparison.comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 border rounded bg-gray-50 space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">
                  {comment.user?.email ?? "Unknown User"}
                </span>

                {comment.userId === userId && (
                  <form
                    action={async () => {
                      "use server";
                      await deleteComment(comment.id, comparison.id, userId);
                    }}
                  >
                    <button className="text-red-600 text-xs hover:underline">
                      Delete
                    </button>
                  </form>
                )}
              </div>

              <p className="text-sm text-gray-700">{comment.text}</p>

              <p className="text-xs text-gray-500">
                {comment.createdAt.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVITY LOG */}
      <div className="p-4 border rounded bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Activity Log</h2>

        <ul className="space-y-2 text-sm">
          {comparison.activities.map((log) => (
            <li key={log.id} className="border p-2 rounded bg-gray-50">
              <strong>{log.action}</strong> — {log.createdAt.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
