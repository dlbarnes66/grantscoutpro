"use client";

import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsBreadcrumbs from "@/components/settings/SettingsBreadcrumbs";

export default function SettingsPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <SettingsHeader title={title} />
      <SettingsBreadcrumbs />
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
        {children}
      </div>
    </div>
  );
}
