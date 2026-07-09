export default function DocsHomePage() {
  return (
    <div className="p-12 space-y-8">
      <h1 className="text-4xl font-bold">GrantScout Documentation</h1>

      <p className="text-gray-600 max-w-2xl">
        Learn how to use GrantScout Pro’s grant intelligence engine, AI matching, scoring, applications, and workspace tools.
      </p>

      <div className="grid grid-cols-3 gap-8">
        <DocCard title="Getting Started" link="/docs/getting-started" />
        <DocCard title="Grant Search" link="/docs/search" />
        <DocCard title="AI Matching" link="/docs/matching" />
        <DocCard title="GrantRadar Scoring" link="/docs/scoring" />
        <DocCard title="Applications" link="/docs/applications" />
        <DocCard title="Workspaces" link="/docs/workspaces" />
      </div>
    </div>
  );
}

function DocCard({ title, link }: any) {
  return (
    <a href={link} className="border rounded p-6 hover:bg-gray-50 block">
      <h3 className="text-xl font-semibold">{title}</h3>
    </a>
  );
}
