export function CategoryAlignment({
  categories
}: {
  categories: { name: string; score: number }[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Category Alignment
      </h2>

      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{cat.name}</span>
            <span className="font-semibold text-slate-100">
              {cat.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
