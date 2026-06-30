"use client";

import { BellIcon } from "@heroicons/react/24/outline";

export function Topbar() {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/60 backdrop-blur flex items-center justify-between px-6">
      <div className="text-sm font-medium text-slate-200">
        GrantScout Pro • AI Grant Platform
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative rounded-full p-1 hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5 text-slate-300" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
          <div className="text-xs">
            <div className="font-semibold text-slate-100">Darryl Barnes</div>
            <div className="text-slate-400">Founder • GrantDynamics</div>
          </div>
        </div>
      </div>
    </header>
  );
}
