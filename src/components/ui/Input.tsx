"use client";

import React from "react";
import clsx from "clsx";

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export default function Input({
  value,
  onChange,
  placeholder,
  className,
}: InputProps) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={clsx(
        "px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white",
        className
      )}
    />
  );
}
