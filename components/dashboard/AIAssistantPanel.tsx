"use client";

export interface AIAssistantPanelProps {
  placeholder?: string;
}

export default function AIAssistantPanel({ placeholder = "AI Assistant Panel Placeholder" }: AIAssistantPanelProps) {
  return (
    <div className="p-4 rounded-md border border-slate-800 bg-slate-900 text-slate-200">
      <p>{placeholder}</p>
    </div>
  );
}
