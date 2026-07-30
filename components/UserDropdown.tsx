"use client";

import { UserButton, useUser } from "@clerk/nextjs";

interface ClerkUser {
  firstName?: string | null;
  username?: string | null;
}

export default function UserDropdown() {
  const { user } = useUser();

  const typedUser = user as ClerkUser | null;

  return (
    <div className="flex items-center gap-3">
      {/* User Name (optional) */}
      {typedUser && (
        <span className="hidden md:block text-gray-700 font-medium">
          {typedUser.firstName || typedUser.username || "User"}
        </span>
      )}

      {/* Clerk User Dropdown */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10 border border-gray-300 shadow-sm",
            userButtonPopoverCard: "shadow-lg border rounded-lg",
            userButtonPopoverFooter: "hidden",
          },
        }}
        afterSignOutUrl="/sign-in"
      />
    </div>
  );
}
