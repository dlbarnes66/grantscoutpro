"use client";

export function MatchResults({ results }: { results: any[] }) {
  if (!results || results.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No matches found. Try adjusting your criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((r, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold">{r.title}</h3>
          <p className="text-sm text-gray-600">{r.description}</p>
          <div className="mt-2 text-blue-600 font-medium">
            Score: {Math.round(r.score * 100)}%
          </div>
        </div>
      ))}
    </div>
  );
}
