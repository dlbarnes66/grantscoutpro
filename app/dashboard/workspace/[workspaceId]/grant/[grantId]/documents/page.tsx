"use client";

export default function GrantDocumentsPage({
  params,
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Grant Documents</h2>

      <div className="text-sm text-gray-600">
        <p>Workspace ID: {workspaceId}</p>
        <p>Grant ID: {grantId}</p>
      </div>

      <p className="text-gray-700">
        This is a placeholder component for the Grant Document Vault.  
        You can replace this with the real document viewer, uploader, or AI document tools later.
      </p>
    </div>
  );
}
