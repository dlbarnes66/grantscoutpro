export default function DashboardHomePage() {
  return (
    <div className="space-y-10">

      {/* STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#11233F] rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Active Grants</h3>
          <p className="text-4xl font-bold text-[#00E5FF]">12</p>
        </div>

        <div className="p-6 bg-[#11233F] rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Pending Submissions</h3>
          <p className="text-4xl font-bold text-[#00E5FF]">4</p>
        </div>

        <div className="p-6 bg-[#11233F] rounded-xl">
          <h3 className="text-xl font-semibold mb-2">AI Suggestions</h3>
          <p className="text-4xl font-bold text-[#00E5FF]">9</p>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/workspace"
            className="p-6 bg-[#11233F] rounded-xl hover:bg-[#1A345A] transition block"
          >
            <h3 className="text-xl font-semibold mb-2">Open Workspaces</h3>
            <p className="text-gray-300">Manage grants, documents, and collaboration.</p>
          </a>

          <a
            href="/compare"
            className="p-6 bg-[#11233F] rounded-xl hover:bg-[#1A345A] transition block"
          >
            <h3 className="text-xl font-semibold mb-2">Compare Grants</h3>
            <p className="text-gray-300">Side-by-side grant analysis with AI insights.</p>
          </a>

          <a
            href="/recommendations"
            className="p-6 bg-[#11233F] rounded-xl hover:bg-[#1A345A] transition block"
          >
            <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
            <p className="text-gray-300">Personalized grant suggestions for your org.</p>
          </a>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Recent Activity</h2>

        <div className="p-6 bg-[#11233F] rounded-xl">
          <p className="text-gray-300">
            Your recent grant submissions, workspace updates, and AI insights will appear here.
          </p>
        </div>
      </section>

    </div>
  );
}
