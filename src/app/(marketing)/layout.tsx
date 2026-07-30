import "../globals.css";
import { ReactNode } from "react";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            GrantScout Pro
          </Link>

          <nav className="flex items-center gap-6 text-gray-700">
            <Link href="/pricing" className="hover:text-black">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-black">
              Docs
            </Link>
            <Link href="/sign-in" className="hover:text-black">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-gray-600 text-sm flex justify-between">
          <p>© {new Date().getFullYear()} GrantScout Pro</p>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
