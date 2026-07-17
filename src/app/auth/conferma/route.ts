import { NextResponse } from "next/server";

import { creaClientSupabaseServer } from "@/lib/supabase/server";

const destinazioniConsentite = new Set(["/aggiorna-password", "/dashboard"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const codice = url.searchParams.get("code");
  const successivoRichiesto = url.searchParams.get("successivo") ?? "/dashboard";
  const successivo = destinazioniConsentite.has(successivoRichiesto)
    ? successivoRichiesto
    : "/dashboard";

  if (codice) {
    const supabase = await creaClientSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(codice);

    if (!error) {
      return NextResponse.redirect(new URL(successivo, url.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?motivo=collegamento-non-valido", url.origin),
  );
}
