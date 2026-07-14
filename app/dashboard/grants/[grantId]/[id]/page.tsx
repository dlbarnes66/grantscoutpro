export default function GrantDetailsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">
        Grant Title Goes Here
      </h1>

      <p className="text-slate-400 mb-8">
        Full description of the grant opportunity goes here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-2">Eligibility</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Eligibility details go here.
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-2">Funding</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Funding details go here.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="btn btn-primary">Write Proposal with AI</button>
        <button className="btn btn-secondary">Save Grant</button>
      </div>
    </div>
  );
}
