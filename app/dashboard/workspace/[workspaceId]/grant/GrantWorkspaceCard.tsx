export default function GrantWorkspaceCard({
  grant,
  workspaceId
}: {
  grant: {
    id: string;
    title: string;
    summary: string;
    status: string;
    priority: string;
    deadline?: string;
  };
  workspaceId: string;
}) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm space-y-3">
      <h2 className="text-xl font-semibold">{grant.title}</h2>

      <p className="text-gray-700 whitespace-pre-wrap">{grant.summary}</p>

      <p className="text-sm">
        <strong>Status:</strong> {grant.status}
      </p>

      <p className="text-sm">
        <strong>Priority:</strong> {grant.priority}
      </p>

      {grant.deadline && (
        <p className="text-sm text-red-600">
          <strong>Deadline:</strong> {grant.deadline}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <a
          href={`/dashboard/workspace/${workspaceId}/grant/${grant.id}`}
          className="p-2 bg-blue-600 text-white rounded-md text-center text-sm font-semibold"
        >
          Dashboard
        </a>

        <a
          href={`/dashboard/workspace/${workspaceId}/grant/${grant.id}/sections`}
          className="p-2 bg-purple-600 text-white rounded-md text-center text-sm font-semibold"
        >
          Narrative
        </a>

        <a
          href={`/dashboard/workspace/${workspaceId}/grant/${grant.id}/intelligence`}
          className="p-2 bg-green-600 text-white rounded-md text-center text-sm font-semibold"
        >
          Intelligence
        </a>

        <a
          href={`/dashboard/workspace/${workspaceId}/grant/${grant.id}/submission`}
          className="p-2 bg-orange-600 text-white rounded-md text-center text-sm font-semibold"
        >
          Submission
        </a>
      </div>
    </div>
  );
}
