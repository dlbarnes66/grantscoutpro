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
        "rounded-lg border border-white/[0.08] bg-white/[0.025] p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
