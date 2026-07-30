"use client";

export default function ManualSidebar({ manual, onSelect }: any) {
  return (
    <div className="col-span-1 border rounded p-4 space-y-3">
      <h2 className="text-lg font-bold mb-4">User Manual</h2>

      {manual.map((section: any) => (
        <button
          key={section.id}
          onClick={() => onSelect(section)}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
        >
          {section.title}
        </button>
      ))}
    </div>
  );
}
