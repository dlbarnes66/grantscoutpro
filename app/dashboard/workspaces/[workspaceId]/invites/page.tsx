// app/dashboard/workspaces/[workspaceId]/invites/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function WorkspaceInvitesPage({
  params,
}: {
  params: { id: string };
}) {
  // ⭐ NextAuth v5 — MUST await auth()
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  const workspaceId = params.id;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      invites: true,
    },
  });

  if (!workspace) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Workspace Invites</h1>

      {workspace.invites.length === 0 ? (
        <p className="text-gray-600">No invites yet.</p>
      ) : (
        <ul className="space-y-3">
          {workspace.invites.map((invite) => (
            <li
              key={invite.id}
              className="p-4 border rounded bg-white shadow-sm"
            >
              <p><strong>Email:</strong> {invite.email}</p>
              <p><strong>Status:</strong> {invite.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
