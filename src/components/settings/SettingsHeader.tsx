"use client"

import MobileSettingsSidebar from "@/components/settings/MobileSettingsSidebar";

export default function SettingsHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-brandBlue">{title}</h1>

      <div className="md:hidden">
        <MobileSettingsSidebar />
      </div>
    </header>
  );
}
