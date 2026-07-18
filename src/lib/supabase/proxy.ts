import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { opzioniCookieSessione } from "@/lib/supabase/cookie";

const percorsiPrivati = [
  "/dashboard",
  "/clienti",
  "/polizze",
  "/scaduti",
  "/compagnie",
  "/contatti",
  "/utenti",
  "/impostazioni",
  "/piattaforma",
];

function percorsoPrivato(pathname: string) {
  return percorsiPrivati.some(
    (percorso) => pathname === percorso || pathname.startsWith(`${percorso}/`),
  );
}

function rispostaPrivata(request: NextRequest) {
  const risposta = NextResponse.next({ request });
  risposta.headers.set("Cache-Control", "private, no-store, max-age=0");
  risposta.headers.set("Pragma", "no-cache");
  risposta.headers.set("Expires", "0");
  return risposta;
}

export async function aggiornaSessione(request: NextRequest) {
  const richiedeSessione = percorsoPrivato(request.nextUrl.pathname);
  let risposta = richiedeSessione
    ? rispostaPrivata(request)
    : NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookieDaSalvare, headerDaSalvare) {
          cookieDaSalvare.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          risposta = richiedeSessione
            ? rispostaPrivata(request)
            : NextResponse.next({ request });

          cookieDaSalvare.forEach(({ name, value, options }) => {
            risposta.cookies.set(name, value, options);
          });

          Object.entries(headerDaSalvare ?? {}).forEach(([nome, valore]) => {
            risposta.headers.set(nome, valore);
          });
        },
      },
      cookieOptions: opzioniCookieSessione(),
    },
  );

  const { data } = await supabase.auth.getClaims();
  const autenticato = Boolean(data?.claims?.sub);

  if (!autenticato && richiedeSessione) {
    const destinazione = request.nextUrl.clone();
    destinazione.pathname = "/login";
    destinazione.searchParams.set("motivo", "sessione-richiesta");
    const rispostaRedirect = NextResponse.redirect(destinazione);
    risposta.cookies.getAll().forEach((cookie) => {
      rispostaRedirect.cookies.set(cookie);
    });
    rispostaRedirect.headers.set("Cache-Control", "private, no-store, max-age=0");
    rispostaRedirect.headers.set("Pragma", "no-cache");
    rispostaRedirect.headers.set("Expires", "0");
    return rispostaRedirect;
  }

  return risposta;
}
