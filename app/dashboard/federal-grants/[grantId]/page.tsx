import { prisma } from "@/lib/prisma";
import SaveButton from "./SaveButton";
import CompareButton from "./CompareButton";
import { generateAISummary, generateGrantScores } from "./actions";

export default async function GrantDetailPage({ params }) {
  const grant = await prisma.federalGrant.findUnique({
    where: { id: params.id },
  });

  if (!grant) {
    return <div className="p-6">Grant not found</div>;
  }

  const profile = {
    mission: "Nonprofit mission placeholder",
    focusAreas: ["Education", "Community Development"],
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{grant.title}</h1>

      <div className="flex gap-4">
        <SaveButton grantId={grant.id} />
        <CompareButton grantId={grant.id} />
      </div>

      <form action={async () => await generateAISummary(grant.id)}>
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
          Generate AI Summary
        </button>
      </form>

      <form action={async () => await generateGrantScores(grant.id, profile)}>
        <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded">
          Generate AI Scores
        </button>
      </form>

      <div className="space-y-2 text-sm">
        <div><strong>Agency:</strong> {grant.agency}</div>
        <div><strong>Category:</strong> {grant.category}</div>
        <div><strong>Deadline:</strong> {grant.deadline?.toISOString().split("T")[0]}</div>
        <div><strong>Amount:</strong> {grant.amount ? `$${grant.amount.toLocaleString()}` : "—"}</div>
        <a
          href={grant.url ?? "#"}
          target="_blank"
          className="text-brandBlue underline"
        >
          View on SAM.gov
        </a>
      </div>

      <div className="p-4 border rounded bg-white">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p className="whitespace-pre-line">{grant.summary}</p>
      </div>

      <div className="p-4 border rounded bg-white">
        <h2 className="text-xl font-semibold mb-2">Raw Data</h2>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(grant.raw, null, 2)}
        </pre>
      </div>
    </div>
  );
}
