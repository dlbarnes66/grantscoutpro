"use client";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Workspace</h1>
        <p className="text-muted mt-1">
          Manage members, roles, and invitations for your organization.
        </p>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
