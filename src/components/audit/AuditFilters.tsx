"use client"

export type AuditFilter = "all" | "info" | "warning" | "system";

export function AuditFilters({
  filter,
  onChangeAction
}: {
  filter: AuditFilter;
  onChangeAction: (f: AuditFilter) => void;
}) {
  const filters: { id: AuditFilter; label: string }[] = [
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
          onClick={() => onChangeAction(f.id)}
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
