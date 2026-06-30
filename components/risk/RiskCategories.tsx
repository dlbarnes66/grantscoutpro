export function RiskCategories({ categories }: { categories: any[] }) {
  const levelColor = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-red-400"
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Risk Categories
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-lg bg-slate-800 p-4 space-y-1"
          >
            <div className="text-sm text-slate-300">{cat.label}</div>
            <div className={`text-xs font-semibold ${levelColor[cat.level]}`}>
              {cat.level.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
