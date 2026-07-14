export default function AddonUpgradePage({ params }) {
  const addon = params.addon;

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold mb-4">Upgrade Required</h1>
      <p className="text-lg text-gray-600 mb-6">
        The <strong>{addon}</strong> addon is not active for this workspace.
      </p>
      <a
        href={`/workspace/${params.workspaceId}/billing`}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Upgrade Now
      </a>
    </div>
  );
}
