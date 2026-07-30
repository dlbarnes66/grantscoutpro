"use client";

import Link from "next/link";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function MobileSettingsSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-md border bg-white shadow-sm"
      >
        <Bars3Icon className="h-6 w-6 text-gray-700" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-40">
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg p-6 space-y-6">
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-md border bg-white shadow-sm"
            >
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>

            <nav className="space-y-4">
              <Link href="/dashboard/settings/account" className="block text-gray-700">
                Account Settings
              </Link>
              <Link href="/dashboard/settings/billing" className="block text-gray-700">
                Billing
              </Link>
              <Link href="/dashboard/settings/notifications" className="block text-gray-700">
                Notifications
              </Link>
              <Link href="/dashboard/settings/security" className="block text-gray-700">
                Security
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
