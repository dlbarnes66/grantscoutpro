"use client"

import { useEffect } from "react";
import { ToastProps } from "./types";

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`px-5 py-3 rounded-lg shadow-lg text-white ${colors[type]}`}>
        {message}
      </div>
    </div>
  );
}
