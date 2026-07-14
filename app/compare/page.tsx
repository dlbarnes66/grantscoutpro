export default function ComparePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Compare Grants</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grant A */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-2">Grant A</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Details for Grant A go here.
          </p>
        </div>

        {/* Grant B */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-2">Grant B</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Details for Grant B go here.
          </p>
        </div>
      </div>

      <div className="mt-10 card">
        <h3 className="text-lg font-semibold text-white mb-2">
          AI Comparison Summary
        </h3>
        <p className="text-slate-400 leading-relaxed">
          AI‑generated comparison summary will appear here.
        </p>
      </div>
    </div>
  );
}
