"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPageLayout({
  title,
  lastUpdated,
  intro,
  toc,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  toc: { id: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Grant Scout Pro
          </Link>
          <img src="/brand/icon-mark.svg" alt="Grant Scout Pro" className="h-9 w-9 rounded-lg" />
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          {intro && (
            <div className="mb-10 text-gray-700 leading-relaxed space-y-4">{intro}</div>
          )}

          <nav aria-label="Table of contents" className="mb-10 p-5 rounded-xl bg-gray-50 ring-1 ring-gray-100">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-3">
              Contents
            </p>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[#0F2A4A] hover:text-[#B8903F] hover:underline underline-offset-2"
                  >
                    {i + 1}. {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-10">{children}</div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Grant Scout Pro is a product of Venture Collective Group, LLC.
        </p>
      </div>
    </div>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">{children}</h3>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-[#B8903F]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
