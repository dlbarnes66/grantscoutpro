"use client";

import { useEffect, useState } from "react";
import { ProfileForm } from "./components/ProfileForm";
import { PasswordForm } from "./components/PasswordForm";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/settings/update-profile");
      const data = await res.json();
      setProfile(data);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <ProfileForm profile={profile} />

      <PasswordForm />
    </div>
  );
}
