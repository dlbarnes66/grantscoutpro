"use client";

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications Workspace</h1>
        <p className="text-muted mt-1">
          Track progress, upload documents, and complete your grant applications.
        </p>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
