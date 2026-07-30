"use client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
        <p className="text-muted mt-1">
          Organization‑wide settings, controls, and administrative tools.
        </p>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
