// app/dashboard/workspaces/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/* -------------------------------------------------------
   CREATE WORKSPACE
------------------------------------------------------- */
export async function createWorkspace(name: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const orgId = session?.user?.orgId; // ⭐ every user belongs to an org

  if (!userId || !orgId) return null;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      org: {
        connect: { id: orgId }, // ⭐ required relation
      },
      members: {
        create: {
          userId,
          role: "owner", // ⭐ owner stored here
        },
      },
    },
  });

  revalidatePath("/dashboard/workspaces");
  return workspace;
}

/* -------------------------------------------------------
   DELETE WORKSPACE
------------------------------------------------------- */
export async function deleteWorkspace(workspaceId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  await prisma.workspace.delete({
    where: { id: workspaceId },
  });

  revalidatePath("/dashboard/workspaces");
  return true;
}

/* -------------------------------------------------------
   RENAME WORKSPACE
------------------------------------------------------- */
export async function renameWorkspace(workspaceId: string, name: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name },
  });

  revalidatePath(`/dashboard/workspaces/${workspaceId}`);
  return workspace;
}
