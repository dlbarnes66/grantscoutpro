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
      <h1 className="text-4xl font-bold">
        Workspace Dashboard
      </h1>

      <p className="mt-4">
        Workspace ID: {workspaceId}
      </p>

      <p className="mt-8 text-green-500">
        DOCUMENTS URL:
      </p>

      <p>
        /workspace/{workspaceId}/documents/new
      </p>
    </div>
  );
}