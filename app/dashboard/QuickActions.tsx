"use client";

import Link from "next/link";
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowUpOnSquareIcon
} from "@heroicons/react/24/outline";

const actions = [
  {
    href: "/search",
    label: "Search Grants",
    icon: MagnifyingGlassIcon,
    color: "from-blue-500 to-indigo-500"
  },
  {
    href: "/narratives",
    label: "Write Narrative",
    icon: DocumentTextIcon,
    color: "from-purple-500 to-pink-500"
  },
  {
    href: "/budget",
    label: "Build Budget",
    icon: ChartBarIcon,
    color: "from-green-500 to-emerald-500"
  },
  {
    href: "/submission",
    label: "Prepare Submission",
    icon: ArrowUpOnSquareIcon,
    color: "from-orange-500 to-red-500"
  }
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col items-center gap-3 hover:bg-slate-800 transition"
          >
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-sm font-medium text-slate-200 group-hover:text-white">
              {action.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
