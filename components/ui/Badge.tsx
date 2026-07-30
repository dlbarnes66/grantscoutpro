"use client";

import clsx from "clsx";

export default function Badge({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "danger" | "success";
}) {
  const color =
    variant === "danger"
      ? "bg-red-100 text-red-700 border-red-300"
      : variant === "warning"
      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
      : variant === "success"
      ? "bg-green-100 text-green-700 border-green-300"
      : "bg-blue-100 text-blue-700 border-blue-300";

  return (
    <span className={clsx("px-2 py-1 text-xs font-medium rounded border", color)}>
      {children}
    </span>
  );
}
