"use client";

import dynamic from "next/dynamic";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

export default function WorkspaceTopbar({ title }: { title: string }) {
  return (
    <header className="w-full p-6 border-b border-[#1F2F4F] flex justify-between items-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
