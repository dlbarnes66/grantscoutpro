"use client";

export function GrantDocuments({ documents }: { documents: any[] }) {
  const hasDocs = Array.isArray(documents) && documents.length > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <h2 className="text-lg font-semibold">Documents</h2>

      {!hasDocs && (
        <p className="text-sm text-gray-500">No documents uploaded.</p>
      )}

      {hasDocs && (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50 transition"
            >
              <span className="text-sm text-gray-700">{doc.filename}</span>

              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
