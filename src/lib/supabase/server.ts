// src/lib/supabase/server.ts

import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function createSupabaseServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const store = await cookies();
          const cookie = store.get(name);
          return cookie?.value;
        },
        set: async (name: string, value: string, options?: any) => {
          const store = await cookies();
          store.set({
            name,
            value,
            ...options,
          });
        },
        remove: async (name: string, options?: any) => {
          const store = await cookies();
          store.delete({
            name,
            ...options,
          });
        },
      },
    }
  );
}
