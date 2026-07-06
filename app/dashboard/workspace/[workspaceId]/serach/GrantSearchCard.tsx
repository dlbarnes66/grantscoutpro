export default function GrantSearchCard({
  grant
}: {
  grant: {
    title: string;
    summary: string;
    agency?: string;
    deadline?: string;
    score: number;
  };
}) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold">{grant.title}</h2>

      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
        {grant.summary}
      </p>

      {grant.agency && (
        <p className="mt-2 text-sm text-gray-600">
          <strong>Agency:</strong> {grant.agency}
        </p>
      )}

      {grant.deadline && (
        <p className="mt-1 text-sm text-gray-600">
          <strong>Deadline:</strong> {grant.deadline}
        </p>
      )}

      <p className="mt-3 text-lg font-bold text-blue-600">
        Fit Score: {grant.score}/100
      </p>
    </div>
  );
}
