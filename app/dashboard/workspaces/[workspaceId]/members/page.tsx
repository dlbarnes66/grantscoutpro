// app/dashboard/workspaces/[workspaceId]/members/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function WorkspaceMembersPage({
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
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!workspace) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Workspace Members</h1>

      {workspace.members.length === 0 ? (
        <p className="text-gray-600">No members yet.</p>
      ) : (
        <ul className="space-y-3">
          {workspace.members.map((member) => (
            <li
              key={member.id}
              className="p-4 border rounded bg-white shadow-sm"
            >
              <p><strong>Name:</strong> {member.user.name}</p>
              <p><strong>Email:</strong> {member.user.email}</p>
              <p><strong>Role:</strong> {member.role}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
