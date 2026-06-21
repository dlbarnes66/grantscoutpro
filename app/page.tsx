export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Grant Engine
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Your AI-powered platform for grant discovery, automated insights,
          deadline tracking, and workflow management.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href="/start"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Start Free Trial
          </a>

          <a
            href="/search"
            className="text-blue-600 hover:underline font-medium"
          >
            AI Search
          </a>

          <a
            href="/jobs"
            className="text-blue-600 hover:underline font-medium"
          >
            Jobs
          </a>

          <a
            href="/jobs/new"
            className="text-blue-600 hover:underline font-medium"
          >
            Create Job
          </a>
        </div>

        <p className="text-xs text-gray-500">
          No credit card charged today. Cancel anytime during your trial.
        </p>
      </div>
    </div>
  );
}
