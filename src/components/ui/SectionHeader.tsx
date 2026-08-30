"use client"

export default function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold text-slate-200 mb-4">{title}</h2>;
}
