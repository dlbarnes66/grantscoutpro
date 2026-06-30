export function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800 bg-slate-900 p-5 animate-pulse"
        >
          <div className="h-4 w-2/3 bg-slate-700 rounded mb-3" />
          <div className="h-3 w-1/3 bg-slate-800 rounded mb-4" />
          <div className="h-3 w-1/2 bg-slate-800 rounded mb-2" />
          <div className="h-3 w-1/4 bg-slate-800 rounded mb-4" />
          <div className="h-8 w-full bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  );
}
