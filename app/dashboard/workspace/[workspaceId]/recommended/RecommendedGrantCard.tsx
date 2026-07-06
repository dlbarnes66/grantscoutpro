export default function RecommendedGrantCard({
  grant
}: {
  grant: {
    id: string;
    title: string;
    summary: string;
    matchScore: number;
    reasons: string[];
  };
}) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold">{grant.title}</h2>

      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
        {grant.summary}
      </p>

      <p className="mt-3 text-lg font-bold text-green-600">
        Match Score: {grant.matchScore}/100
      </p>

      <h3 className="mt-3 font-semibold">Why this grant matches:</h3>
      <ul className="list-disc ml-6 mt-1">
        {grant.reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
