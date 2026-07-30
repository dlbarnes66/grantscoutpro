"use client";

export default function NotificationFilters({
  filter,
  onChange
}: {
  filter: string;
  onChange: (f: string) => void;
}) {
  const filters = [
    { id: "all", label: "All" },
    { id: "deadline", label: "Deadlines" },
    { id: "ai", label: "AI Insights" },
    { id: "collaboration", label: "Collaboration" },
    { id: "system", label: "System" }
  ];

  return (
    <div className="flex gap-3">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={[
            "px-3 py-2 rounded-md text-sm transition",
            filter === f.id
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          ].join(" ")}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
