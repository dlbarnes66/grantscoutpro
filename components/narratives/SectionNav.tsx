"use client";

export function SectionNav({
  sections,
  active,
  onSelect
}: {
  sections: any[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-100 mb-2">
        Sections
      </h2>

      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSelect(section.id)}
          className={[
            "w-full text-left px-3 py-2 rounded-md text-sm transition",
            active === section.id
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          ].join(" ")}
        >
          {section.title}
        </button>
      ))}
    </div>
  );
}
