interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspacePage({
  params,
}: PageProps) {
  const { workspaceId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Workspace
      </h1>

      <p className="mt-4">
        Workspace ID: {workspaceId}
      </p>
    </div>
  );
}