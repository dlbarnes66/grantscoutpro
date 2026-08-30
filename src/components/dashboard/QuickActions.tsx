"use client"

export interface QuickActionsProps {
  placeholder?: string;
}

export default function QuickActions({ placeholder = "Quick Actions Placeholder" }: QuickActionsProps) {
  return (
    <div className="p-4 rounded-md border border-slate-800 bg-slate-900 text-slate-200">
      <p>{placeholder}</p>
    </div>
  );
}
