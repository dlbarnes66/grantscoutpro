import Link from "next/link";

export function SavedList({
  grants,
  workspaceId,
}: {
  grants: any[];
  workspaceId: string;
}) {
  if (!grants || grants.length === 0) {
    return <p className="text-gray-500">No saved grants yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {grants.map((g) => (
        <Link
          key={g.id}
          href={`/dashboard/${workspaceId}/grant/${g.id}`}
          className="block rounded border border-gray-200 bg-white p-4 hover:bg-gray-50 transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">{g.title}</h3>

          {g.agency && (
            <p className="text-gray-600 text-sm">{g.agency}</p>
          )}

          {g.summary && (
            <p className="text-gray-700 text-sm mt-2">{g.summary}</p>
          )}

          <p className="text-gray-500 text-xs mt-3">
            Deadline:{" "}
            {g.deadline
              ? new Date(g.deadline).toLocaleDateString()
              : "N/A"}
          </p>
        </Link>
      ))}
    </div>
  );
}
