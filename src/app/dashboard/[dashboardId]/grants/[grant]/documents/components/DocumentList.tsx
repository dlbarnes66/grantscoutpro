"use client";

export function DocumentList({ documents, grantId }: any) {
  if (documents.length === 0) {
    return <p className="text-gray-500">No documents uploaded yet.</p>;
  }

  async function deleteDoc(id: string) {
    await fetch(`/api/grant-documents/${grantId}/delete`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    location.reload();
  }

  return (
    <div className="space-y-4">
      {documents.map((doc: any) => (
        <div
          key={doc.id}
          className="border rounded p-4 flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold">{doc.filename}</h3>
            <a
              href={doc.url}
              target="_blank"
              className="text-blue-600 underline"
            >
              View Document
            </a>
          </div>

          <button
            onClick={() => deleteDoc(doc.id)}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
