import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CollaborationWorkspace from "@/components/collaboration/CollaborationWorkspace";

type Props = {
  params: { collaborationId: string };
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function CollaborationPage({ params }: Props) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspaceId = params.collaborationId;

  return (
    <div className="h-full w-full flex flex-col">
      <CollaborationWorkspace workspaceId={workspaceId} userId={userId} />
    </div>
  );
}
