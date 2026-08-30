"use client"

import React from "react";

export default function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-500 text-white",
    danger: "bg-red-600 text-white",
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
