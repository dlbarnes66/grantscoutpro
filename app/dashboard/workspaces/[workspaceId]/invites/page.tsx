import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function WorkspaceInvitesPage({
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
        Only workspace owners or admins can manage invites.
      </div>
    );
  }

  const invites = await prisma.workspaceInvite.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Workspace Invites</h1>

      {/* INVITE FORM */}
      <div className="p-4 border rounded bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Invite a Member</h2>

        <form
          action={async (formData) => {
            "use server";
            const email = (formData.get("email") as string).toLowerCase();

            await prisma.workspaceInvite.create({
              data: {
                workspaceId,
                email,
                invitedById: userId,
              },
            });
          }}
          className="flex gap-3"
        >
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            className="border p-2 rounded flex-1"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Send Invite
          </button>
        </form>
      </div>

      {/* INVITE LIST */}
      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="p-4 border rounded bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{invite.email}</div>
              <div className="text-sm text-gray-600">
                Status: {invite.status}
              </div>
            </div>

            {/* REVOKE INVITE */}
            {invite.status === "pending" && (
              <form
                action={async () => {
                  "use server";
                  await prisma.workspaceInvite.update({
                    where: { id: invite.id },
                    data: { status: "revoked" },
                  });
                }}
              >
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                  Revoke
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
