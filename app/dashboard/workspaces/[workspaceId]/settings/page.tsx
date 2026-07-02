import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/");

  const workspaceId = params.id;

  // Load membership
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId },
    include: { workspace: true },
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

  if (!isOwner && !isAdmin) {
    return (
      <div className="p-6 text-red-600 font-semibold">
        Only workspace owners or admins can access settings.
      </div>
    );
  }

  const workspace = membership.workspace;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Workspace Settings</h1>

      {/* RENAME WORKSPACE */}
      <div className="p-4 border rounded bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Rename Workspace</h2>

        <form
          action={async (formData) => {
            "use server";
            const newName = formData.get("name") as string;

            await prisma.workspace.update({
              where: { id: workspaceId },
              data: { name: newName },
            });
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            name="name"
            defaultValue={workspace.name}
            className="border p-2 rounded flex-1"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Save
          </button>
        </form>
      </div>

      {/* DELETE WORKSPACE (OWNER ONLY) */}
      {isOwner && (
        <div className="p-4 border rounded bg-white shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>

          <form
            action={async () => {
              "use server";

              // Delete workspace + all related data
              await prisma.workspace.delete({
                where: { id: workspaceId },
              });

              redirect("/dashboard/workspaces");
            }}
          >
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={() => {
                if (!confirm("Are you sure you want to delete this workspace? This cannot be undone.")) {
                  throw new Error("User cancelled deletion");
                }
              }}
            >
              Delete Workspace
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
