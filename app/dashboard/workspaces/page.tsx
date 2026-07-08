// app/dashboard/workspaces/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function WorkspacesPage() {
  // ⭐ NextAuth v5 — MUST await auth()
  const session = await auth();
  const userId = session?.user?.id;
  const orgId = session?.user?.orgId;

  if (!userId || !orgId) {
    return <div className="p-6">Not authorized</div>;
  }

  // ⭐ Fetch all workspaces for the user's org
  const workspaces = await prisma.workspace.findMany({
    where: { orgId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Workspaces</h1>

      {workspaces.length === 0 ? (
        <p className="text-gray-600">You have no workspaces yet.</p>
      ) : (
        <ul className="space-y-4">
          {workspaces.map((ws) => (
            <li
              key={ws.id}
              className="p-4 border rounded bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{ws.name}</p>
                <p className="text-sm text-gray-600">
                  {ws.members.length} member{ws.members.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Link
                href={`/dashboard/workspaces/${ws.id}`}
                className="text-blue-600 hover:underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
