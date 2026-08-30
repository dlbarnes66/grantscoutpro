"use client"

import { BellIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Topbar() {
  return (
    <header className="w-full h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
      
      {/* Left side — Page Title */}
      <div className="text-lg font-semibold text-white tracking-tight">
        GrantScout Pro
      </div>

      {/* Right side — Actions */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button className="relative group">
          <BellIcon className="h-6 w-6 text-slate-400 group-hover:text-white transition" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="text-sm font-medium text-white">Darryl Barnes</div>
            <div className="text-xs text-slate-400">Founder • GrantDynamics</div>
          </div>

          <Image
            src="/avatar.png"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full border border-slate-700"
          />
        </div>
      </div>
    </header>
  );
}
