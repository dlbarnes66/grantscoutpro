"use client";

export function HelpSidebar({
  sections,
  onSelect,
}: {
  sections: any[];
  onSelect: (section: any) => void;
}) {
  return (
    <aside className="w-64 border-r border-slate-800 pr-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-3">
        Topics
      </h2>

      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => onSelect(section)}
              className="w-full text-left px-3 py-2 rounded bg-slate-800/40 hover:bg-slate-800/60 text-slate-200"
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
