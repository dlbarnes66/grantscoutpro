"use client";

export function GrantHeader({ grant }: { grant: any }) {
  const deadline =
    grant.deadline && new Date(grant.deadline).toLocaleDateString();
  const posted =
    grant.postedDate && new Date(grant.postedDate).toLocaleDateString();
  const updated =
    grant.updatedDate && new Date(grant.updatedDate).toLocaleDateString();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
      <h1 className="text-2xl font-bold">{grant.title}</h1>

      <p className="text-sm text-gray-600">
        {grant.agency ?? "Unknown agency"} • {grant.category ?? "Uncategorized"}
      </p>

      <p className="text-sm text-gray-500">
        Status: <span className="font-medium">{grant.status}</span>
      </p>

      {deadline && (
        <p className="text-sm text-gray-500">Deadline: {deadline}</p>
      )}

      {posted && (
        <p className="text-sm text-gray-500">Posted: {posted}</p>
      )}

      {updated && (
        <p className="text-sm text-gray-500">Last Updated: {updated}</p>
      )}

      {grant.foundationName && (
        <p className="text-sm text-gray-500">
          Foundation:{" "}
          <span className="font-medium">{grant.foundationName}</span>
        </p>
      )}

      {grant.philanthropicType && (
        <p className="text-sm text-gray-500">
          Philanthropy:{" "}
          <span className="font-medium">{grant.philanthropicType}</span>
        </p>
      )}
    </div>
  );
}
