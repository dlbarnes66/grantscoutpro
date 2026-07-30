"use client";

export function HistoryList({ history }: any) {
  if (!history || history.length === 0) {
    return <p className="text-gray-500">No history recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {history.map((item: any, idx: number) => (
        <div key={idx} className="border rounded p-4">
          <h3 className="font-semibold capitalize mb-2">
            {item.type.replace(/([A-Z])/g, " $1")}
          </h3>

          <p className="text-xs text-gray-500 mb-2">
            {new Date(item.createdAt).toLocaleString()}
          </p>

          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(item.data, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
