import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function WorkspaceMembersPage({
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
        Only workspace owners or admins can manage members.
      </div>
    );
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Workspace Members</h1>

      <div className="space-y-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="p-4 border rounded bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{m.user.email}</div>
              <div className="text-sm text-gray-600">Role: {m.role}</div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              {/* CHANGE ROLE */}
              {isOwner && m.userId !== userId && (
                <form
                  action={async (formData) => {
                    "use server";
                    const newRole = formData.get("role") as string;

                    await prisma.workspaceMember.update({
                      where: { id: m.id },
                      data: { role: newRole },
                    });
                  }}
                  className="flex gap-2"
                >
                  <select
                    name="role"
                    defaultValue={m.role}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                    Update
                  </button>
                </form>
              )}

              {/* REMOVE MEMBER */}
              {isOwner && m.userId !== userId && (
                <form
                  action={async () => {
                    "use server";
                    await prisma.workspaceMember.delete({
                      where: { id: m.id },
                    });
                  }}
                >
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                    Remove
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
