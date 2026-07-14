import {
  SparklesIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  BookmarkSquareIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold text-white mb-4">
        Discover Grants. Write Faster. Win More.
      </h1>

      <p className="text-slate-400 text-lg leading-relaxed mb-10">
        GrantScout Pro helps you find the right grants, analyze eligibility,
        compare opportunities, and generate polished proposals with AI.
      </p>

      <div className="flex gap-4 mb-12">
        <button className="btn btn-primary">Search Grants</button>
        <button className="btn btn-secondary">Write with AI</button>
        <button className="btn btn-primary">Compare Grants</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            title: "AI Grant Matching",
            description:
              "Instantly find grants that match your mission, location, and organizational profile.",
            icon: SparklesIcon,
          },
          {
            title: "AI Proposal Writer",
            description:
              "Generate full grant proposals, narratives, and responses using your organization’s data.",
            icon: PencilSquareIcon,
          },
          {
            title: "Grant Comparison",
            description:
              "Compare multiple grants side-by-side to see which opportunities offer the best fit.",
            icon: Squares2X2Icon,
          },
          {
            title: "Save & Track Grants",
            description:
              "Save grants, track deadlines, and revisit opportunities anytime.",
            icon: BookmarkSquareIcon,
          },
        ].map((f) => (
          <div
            key={f.title}
            className="p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-md hover:shadow-lg transition"
          >
            <div className="p-4 bg-slate-800 rounded-xl inline-block mb-4 shadow-sm">
              <f.icon className="h-10 w-10 text-blue-500 drop-shadow" />
            </div>
            <h3 className="text-xl font-semibold text-white">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              {f.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button className="btn btn-primary px-8 py-4 text-lg">Get Started</button>
      </div>
    </main>
  );
}
