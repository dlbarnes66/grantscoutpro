import { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { WorkspaceContext } from "./context/WorkspaceContext";

export default async function WorkspaceLayout(
  props: {
    children: ReactNode;
    params: Promise<{ workspaceId: string }>;
  }
) {
  const { children } = props;
  const { workspaceId } = await props.params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      aiUsage: true,
    },
  });

  if (!workspace) {
    return <div className="p-6 text-red-500">Workspace not found</div>;
  }

  const aiUsageSummary = {
    tokensUsed: workspace.aiUsage.reduce((sum, u) => sum + u.tokens, 0),
    cost: workspace.aiUsage.reduce((sum, u) => sum + u.cost, 0),
  };

  const contextValue = {
    id: workspace.id,
    name: workspace.name,
    aiUsage: aiUsageSummary,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}
