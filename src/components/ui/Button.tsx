"use client";

import { cn } from "@/lib/utils";

export default function Button({
  children,
  onClickAction,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  className,
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2",
    lg: "px-4 py-3 text-lg",
  };

  return (
    <button
      disabled={disabled || loading}
      onClick={onClickAction}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
    >
      {loading && (
        <span className="animate-spin mr-2 border-t border-white rounded-full w-4 h-4" />
      )}
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
