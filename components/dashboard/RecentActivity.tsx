"use client";

export function RecentActivity() {
  const items = [
    { text: "Generated narrative for Youth Empowerment Grant" },
    { text: "Updated budget for Community Health Initiative" },
    { text: "Reviewed compliance for STEM Innovation Fund" },
    { text: "Saved 3 new grants from search results" }
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Recent Activity
      </h2>

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-300">
            • {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
