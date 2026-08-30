"use client";

import React from "react";

export default function CloseoutShell({
  closeoutId,
  children,
}: {
  closeoutId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Closeout {closeoutId}</h1>
      {children}
    </div>
  );
}
