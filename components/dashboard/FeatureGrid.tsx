import {
  SparklesIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  BookmarkSquareIcon,
} from "@heroicons/react/24/outline";

const features = [
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
];

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      {features.map((f) => (
        <div
          key={f.title}
          className="p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-sm hover:shadow-md transition"
        >
          <f.icon className="h-8 w-8 text-blue-400 mb-4 drop-shadow-sm" />
          <h3 className="text-lg font-semibold text-white">{f.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed mt-1">{f.description}</p>
        </div>
      ))}
    </div>
  );
}
