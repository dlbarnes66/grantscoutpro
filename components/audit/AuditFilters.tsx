"use client";

export function AuditFilters({
  filter,
  onChange
}: {
  filter: string;
  onChange: (f: string) => void;
}) {
  const filters = [
    { id: "all", label: "All" },
    { id: "info", label: "Info" },
    { id: "warning", label: "Warnings" },
    { id: "system", label: "System Events" }
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
