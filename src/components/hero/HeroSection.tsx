"use client"

import React from "react";

export default function HeroSection({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="p-10 bg-blue-600 text-white rounded-lg space-y-3">
      <h1 className="text-3xl font-bold">{title || "Welcome"}</h1>
      {subtitle && <p className="text-lg">{subtitle}</p>}
    </div>
  );
}
