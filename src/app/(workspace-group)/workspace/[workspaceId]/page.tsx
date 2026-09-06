interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspacePage({
  params,
}: PageProps) {
  const { workspaceId } = await params;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">
        Workspace Overview
      </h1>

      <p className="text-slate-400 mb-8">
        Manage grants, documents, collaboration,
        and AI-powered proposal development.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">
            Documents
          </p>

          <p className="text-4xl font-bold text-cyan-400 mt-3">
            8
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">
            Grants
          </p>

          <p className="text-4xl font-bold text-cyan-400 mt-3">
            12
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">
            AI Analyses
          </p>

          <p className="text-4xl font-bold text-cyan-400 mt-3">
            47
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">
            Team Members
          </p>

          <p className="text-4xl font-bold text-cyan-400 mt-3">
            5
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">
          Workspace Information
        </h2>

        <p className="text-slate-400">
          Workspace ID: {workspaceId}
        </p>
      </div>
    </div>
  );
}