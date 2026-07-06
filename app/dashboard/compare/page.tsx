// app/dashboard/compare/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CompareView from "@/components/compare/CompareView";

export default async function CompareRootPage({
  searchParams,
}: {
  searchParams: { workspaceId?: string };
}) {
  // ⭐ NextAuth v5 — auth() must be awaited
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) redirect("/");

  const workspaceId = searchParams.workspaceId;
  if (!workspaceId) redirect("/dashboard");

  return (
    <CompareView
      grantId=""
      workspaceId={workspaceId}
      userId={userId}
    />
  );
}
