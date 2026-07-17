import "server-only";

import { createClient } from "@supabase/supabase-js";

export function creaClientSupabaseAmministratore() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chiaveSegreta = process.env.SUPABASE_SECRET_KEY;

  if (!url || !chiaveSegreta) {
    throw new Error("Configurazione amministrativa Supabase incompleta");
  }

  return createClient(url, chiaveSegreta, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
