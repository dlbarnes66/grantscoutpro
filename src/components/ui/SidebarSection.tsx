"use client"

export default function SidebarSection({ label }: { label: string }) {
  return (
    <div className="text-xs uppercase tracking-wider text-slate-500 px-3 mt-6 mb-2">
      {label}
    </div>
  );
}
