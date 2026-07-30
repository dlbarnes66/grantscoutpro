"use client";

import { ReactNode } from "react";

interface WorkspaceShellProps {
  title: string;
  children: ReactNode;
}

export default function WorkspaceShell({ title, children }: WorkspaceShellProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
