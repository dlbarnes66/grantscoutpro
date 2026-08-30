"use client"

import { Toaster } from "react-hot-toast";

export interface ToastProviderProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function ToastProviderComponent({
  position = "top-right"
}: ToastProviderProps) {
  return <Toaster position={position} />;
}

export default function ToastProvider() {
  return <ToastProviderComponent />;
}
