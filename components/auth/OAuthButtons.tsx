"use client";

import { GoogleIcon, MicrosoftIcon } from "./ProviderIcons";

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <button className="w-full flex items-center justify-center gap-2 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm hover:bg-slate-700 transition">
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>

      <button className="w-full flex items-center justify-center gap-2 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm hover:bg-slate-700 transition">
        <MicrosoftIcon className="h-4 w-4" />
        Continue with Microsoft
      </button>
    </div>
  );
}
