"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { ModalProps } from "./types";

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-slate-400 hover:text-white transition" />
          </button>
        </div>

        <div className="text-slate-300">{children}</div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button className="btn btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  );
}
