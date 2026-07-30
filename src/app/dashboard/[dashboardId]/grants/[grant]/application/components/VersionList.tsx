"use client";

export function VersionList({ versions }: any) {
  if (!versions || versions.length === 0) {
    return <p className="text-gray-500">No versions yet.</p>;
  }

  return (
    <div className="border rounded p-4 space-y-4">
      <h3 className="font-semibold">Version History</h3>

      {versions.map((v: any) => (
        <div key={v.id} className="border rounded p-3">
          <p className="text-xs text-gray-500">
            {new Date(v.createdAt).toLocaleString()}
          </p>
          <pre className="whitespace-pre-wrap text-sm mt-2">
            {v.content}
          </pre>
        </div>
      ))}
    </div>
  );
}
