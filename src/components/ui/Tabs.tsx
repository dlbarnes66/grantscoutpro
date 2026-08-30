"use client";

export default function Tabs({
  tabs,
  current,
  onSelectAction,
}: {
  tabs: { id: string; label: string; content?: React.ReactNode }[];
  current: string;
  onSelectAction: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-[#1F2F4F] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectAction(tab.id)}
            className={`text-lg ${
              current === tab.id
                ? "text-[#00E5FF] font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{tabs.find((t) => t.id === current)?.content}</div>
    </div>
  );
}
