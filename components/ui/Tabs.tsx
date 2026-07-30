"use client";

import { useState } from "react";
import { TabItem } from "./types";

export default function Tabs({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex gap-4 border-b border-slate-800 mb-6">
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`pb-3 text-sm font-medium transition ${
              active === i
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>{tabs[active].content}</div>
    </div>
  );
}
