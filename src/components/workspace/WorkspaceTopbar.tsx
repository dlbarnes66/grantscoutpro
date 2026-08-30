"use client";

import { UserButton } from "@clerk/nextjs";

export default function WorkspaceTopbar({ title }: { title: string }) {
  return (
    <header className="w-full p-6 border-b border-[#1F2F4F] flex justify-between items-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
