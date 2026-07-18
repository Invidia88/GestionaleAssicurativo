import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { opzioniCookieSessione } from "@/lib/supabase/cookie";

export async function creaClientSupabaseServer() {
  const archivioCookie = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return archivioCookie.getAll();
        },
        setAll(cookieDaSalvare) {
          try {
            cookieDaSalvare.forEach(({ name, value, options }) => {
              archivioCookie.set(name, value, options);
            });
          } catch {
            // I Server Component possono leggere i cookie ma non modificarli.
            // Il rinnovo della sessione viene completato da src/proxy.ts.
          }
        },
      },
      cookieOptions: opzioniCookieSessione(),
    },
  );
}
