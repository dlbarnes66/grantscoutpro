"use client"

export type NotificationFilter =
  | "all"
  | "deadline"
  | "ai"
  | "collaboration"
  | "system";

export default function NotificationFilters({
  active,
  onChangeAction
}: {
  active: NotificationFilter;
  onChangeAction: (f: NotificationFilter) => void;
}) {
  const filters: { id: NotificationFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "deadline", label: "Deadlines" },
    { id: "ai", label: "AI Events" },
    { id: "collaboration", label: "Collaboration" },
    { id: "system", label: "System Alerts" }
  ];

  return (
    <div className="flex gap-3">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChangeAction(f.id)}
          className={[
            "px-3 py-2 rounded-md text-sm transition",
            active === f.id
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
