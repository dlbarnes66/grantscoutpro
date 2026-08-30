"use client";

import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-md border border-slate-700 bg-slate-800 p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
